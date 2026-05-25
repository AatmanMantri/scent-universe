#!/usr/bin/env python3
"""
Scent Universe — Shopify catalog fetcher (no LLM).

Fetches perfume products from Shopify stores via products.json + HTML note parsing,
computes 3D coordinates with UMAP, writes src/data/scrapedPerfumes.json.

Usage:
  cd scraper && pip install -r requirements.txt
  python fetch_shopify.py
  python fetch_shopify.py --force
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
from html import unescape
from pathlib import Path
from urllib.parse import urlparse

import requests
import umap
from sklearn.feature_extraction.text import CountVectorizer

STORES = [
    {"domain": "fraganote.com", "brand": "Fraganote"},
    {"domain": "houseofkanzan.com", "brand": "House of Kanzan"},
    {"domain": "www.houseofem5.com", "brand": "House of EM5"},
    {"domain": "rivona.in", "brand": "Rivona"},
]

PERFUME_INCLUDE_RE = re.compile(
    r"perfume|parfum|eau de|edp|edt|fragrance|cologne|attar|extrait",
    re.I,
)
EXCLUDE_RE = re.compile(
    r"\b(gift card|free gift|surprise gift|sample pack|car perfume|"
    r"foot spray|sunscreen|sun drip|spf\d|deodorant|body lotion|"
    r"shampoo|conditioner|soap bar|lip balm|face wash|cleanser|"
    r"moisturizer|serum only|toner only|mask only|"
    r"buy any \d|combo pack|bundle of|discovery set|sampler set|"
    r"build your own|choose any|gift set|sample set|experience sample|"
    r"customise your|customize your|beard balm|beard oil)\b",
    re.I,
)

MOOD_KEYWORDS = {
    "smoky": "Smoky",
    "smoke": "Smoky",
    "fresh": "Fresh",
    "citrus": "Bright",
    "bright": "Bright",
    "sweet": "Sweet",
    "gourmand": "Gourmand",
    "vanilla": "Cozy",
    "cozy": "Cozy",
    "warm": "Warm",
    "spicy": "Spicy",
    "spice": "Spicy",
    "floral": "Floral",
    "rose": "Romantic",
    "romantic": "Romantic",
    "woody": "Woody",
    "wood": "Woody",
    "oud": "Opulent",
    "mysterious": "Mysterious",
    "mystery": "Mysterious",
    "clean": "Clean",
    "aquatic": "Fresh",
    "marine": "Fresh",
    "powdery": "Soft",
    "soft": "Soft",
    "bold": "Bold",
    "intense": "Bold",
    "elegant": "Elegant",
    "luxury": "Luxurious",
    "luxurious": "Luxurious",
}

NOTE_KEYWORDS = [
    "oud", "agarwood", "rose", "jasmine", "saffron", "amber", "musk", "vanilla",
    "bergamot", "lavender", "patchouli", "sandalwood", "vetiver", "cedar", "leather",
    "tobacco", "iris", "neroli", "orange blossom", "pear", "raspberry", "pepper",
    "geranium", "tonka", "caramel", "coffee", "incense", "cardamom", "cinnamon",
    "ylang", "tiare", "coconut", "sea salt", "aldehydes", "benzoin", "labdanum",
]

SCRIPT_DIR = Path(__file__).resolve().parent
CACHE_FILE = SCRIPT_DIR / "raw_shopify_cache.json"
OUTPUT_FILE = SCRIPT_DIR.parent / "src" / "data" / "scrapedPerfumes.json"

SESSION = requests.Session()
SESSION.headers.update(
    {"User-Agent": "ScentUniverse/1.0 (+https://github.com/local/scent-universe)"}
)


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s or "unknown"


def strip_html(html: str | None) -> str:
    if not html:
        return ""
    text = unescape(re.sub(r"<[^>]+>", " ", html))
    return re.sub(r"\s+", " ", text).strip()


def split_notes(text: str) -> list[str]:
    if not text:
        return []
    parts = re.split(r"[,;/•|·]+|\band\b", text, flags=re.I)
    notes = []
    for p in parts:
        p = re.sub(r"\s+", " ", p).strip(" .-")
        if len(p) >= 2 and not re.match(r"^\d", p):
            notes.append(p[:80])
    return notes[:12]


def brand_color(brand: str) -> str:
    h = hashlib.md5(brand.encode()).hexdigest()
    r = int(h[0:2], 16) % 156 + 60
    g = int(h[2:4], 16) % 156 + 60
    b = int(h[4:6], 16) % 156 + 60
    return f"#{r:02x}{g:02x}{b:02x}"


def fetch_json(url: str, retries: int = 3) -> dict | list | None:
    for attempt in range(retries):
        try:
            r = SESSION.get(url, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt == retries - 1:
                print(f"  Failed {url}: {e}")
                return None
            time.sleep(1 + attempt)
    return None


def fetch_html(url: str) -> str:
    try:
        r = SESSION.get(url, timeout=30)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print(f"  Failed HTML {url}: {e}")
        return ""


def paginate_products(domain: str) -> list[dict]:
    all_products: list[dict] = []
    page = 1
    while True:
        url = f"https://{domain}/products.json?limit=250&page={page}"
        data = fetch_json(url)
        if not data or "products" not in data:
            break
        batch = data["products"]
        if not batch:
            break
        all_products.extend(batch)
        print(f"  {domain} page {page}: +{len(batch)} products")
        if len(batch) < 250:
            break
        page += 1
        time.sleep(0.3)
    return all_products


def is_perfume_product(product: dict) -> bool:
    title = product.get("title") or ""
    handle = product.get("handle") or ""
    product_type = product.get("product_type") or ""
    tags = product.get("tags") or ""
    if isinstance(tags, list):
        tags = ", ".join(tags)
    blob = f"{title} {handle} {product_type} {tags}"

    if EXCLUDE_RE.search(blob):
        return False

    if PERFUME_INCLUDE_RE.search(blob):
        return True

    tags_lower = tags.lower()
    if "perfume" in tags_lower or "fragrance" in tags_lower:
        return True

    pt_lower = product_type.lower()
    if any(k in pt_lower for k in ("perfume", "fragrance", "parfum", "cologne")):
        return True

    return False


def parse_gender(tags: str | list) -> str:
    if isinstance(tags, list):
        tags = ", ".join(tags)
    t = tags.lower()
    if "unisex" in t:
        return "Unisex"
    if "women" in t or "woman" in t or "her " in t or " for her" in t:
        return "Women"
    if "men" in t or "man" in t or "him " in t or " for him" in t:
        return "Men"
    return "Unisex"


def parse_kanzan_notes(html: str) -> tuple[list[str], list[str], list[str]]:
    top, mid, base = [], [], []
    patterns = [
        (r"First Impression:\s*</strong>\s*([^<]+)", "top"),
        (r"The Heart:\s*</strong>\s*([^<]+)", "mid"),
        (r"The Sillage:\s*</strong>\s*([^<]+)", "base"),
        (r"Top Notes?:\s*</strong>\s*([^<]+)", "top"),
        (r"Heart Notes?:\s*</strong>\s*([^<]+)", "mid"),
        (r"Base Notes?:\s*</strong>\s*([^<]+)", "base"),
    ]
    for pat, kind in patterns:
        m = re.search(pat, html, re.I)
        if not m:
            continue
        notes = split_notes(strip_html(m.group(1)))
        if kind == "top":
            top = notes or top
        elif kind == "mid":
            mid = notes or mid
        else:
            base = notes or base
    return top, mid, base


def parse_structured_notes(text: str) -> tuple[list[str], list[str], list[str]]:
    top, mid, base = [], [], []
    rules = [
        (r"top\s*notes?[:\s-]+([^.\n|]+)", "top"),
        (r"(?:heart|middle)\s*notes?[:\s-]+([^.\n|]+)", "mid"),
        (r"base\s*notes?[:\s-]+([^.\n|]+)", "base"),
        (r"top\s*note[:\s-]+([^.\n|]+)", "top"),
        (r"heart\s*note[:\s-]+([^.\n|]+)", "mid"),
        (r"base\s*note[:\s-]+([^.\n|]+)", "base"),
    ]
    for pat, kind in rules:
        m = re.search(pat, text, re.I)
        if not m:
            continue
        notes = split_notes(m.group(1))
        if kind == "top" and notes:
            top = notes
        elif kind == "mid" and notes:
            mid = notes
        elif kind == "base" and notes:
            base = notes
    return top, mid, base


def extract_keywords_from_prose(text: str) -> list[str]:
    found = []
    lower = text.lower()
    for kw in NOTE_KEYWORDS:
        if kw in lower:
            found.append(kw.title() if kw.islower() else kw)
    # Capitalized multi-word phrases (e.g. Bulgarian Rose)
    for m in re.finditer(
        r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b", text
    ):
        phrase = m.group(1)
        if phrase.lower() not in ("the", "this", "with", "from", "note", "notes"):
            if len(phrase) > 3:
                found.append(phrase)
    seen = set()
    out = []
    for n in found:
        key = n.lower()
        if key not in seen:
            seen.add(key)
            out.append(n)
    return out[:10]


def infer_mood(text: str) -> list[str]:
    lower = text.lower()
    moods = []
    for kw, label in MOOD_KEYWORDS.items():
        if kw in lower and label not in moods:
            moods.append(label)
        if len(moods) >= 3:
            break
    return moods


def clean_title(title: str) -> str:
    t = re.sub(r"\s*\|\s*.*$", "", title)
    t = re.sub(r"\s*-\s*Eau De Parfum.*$", "", t, flags=re.I)
    t = re.sub(r"\s*\d+\s*ml.*$", "", t, flags=re.I)
    return t.strip() or title


def normalize_product(product: dict, brand: str, domain: str) -> dict | None:
    handle = product.get("handle") or ""
    title = clean_title(product.get("title") or "")
    if not title or not handle:
        return None

    body_html = product.get("body_html") or ""
    description = strip_html(body_html)
    if len(description) > 500:
        description = description[:497] + "..."

    url = f"https://{domain}/products/{handle}"
    shopify_id = product.get("id")
    product_id = (
        f"{slugify(brand)}-{shopify_id}"
        if shopify_id
        else f"{slugify(brand)}-{handle}"
    )[:80]

    top, mid, base = [], [], []

    if domain == "houseofkanzan.com":
        html = fetch_html(url)
        if html:
            top, mid, base = parse_kanzan_notes(html)
        time.sleep(0.2)

    if not (top or mid or base):
        top, mid, base = parse_structured_notes(description)
        if not description and body_html:
            top, mid, base = parse_structured_notes(strip_html(body_html))

    if not (top or mid or base) and description:
        keywords = extract_keywords_from_prose(description)
        if keywords:
            mid = keywords

    tags = product.get("tags") or ""
    gender = parse_gender(tags)
    mood = infer_mood(description)

    return {
        "id": product_id,
        "name": title,
        "brand": brand,
        "gender": gender,
        "topNotes": top,
        "middleNotes": mid,
        "baseNotes": base,
        "description": description or f"{title} by {brand}.",
        "mood": mood,
        "url": url,
        "handle": handle,
        "sourceDomain": domain,
    }


def build_document(p: dict) -> str:
    parts = [
        p.get("description") or "",
        " ".join(p.get("topNotes") or []),
        " ".join(p.get("middleNotes") or []),
        " ".join(p.get("baseNotes") or []),
        " ".join(p.get("mood") or []),
    ]
    return " ".join(parts).strip()


def normalize_coords_list(perfumes: list[dict]) -> None:
    """Scale coordinates to ~[-2, 2] so the default Three.js camera can see them."""
    valid = [p for p in perfumes if p.get("coordinates") and len(p["coordinates"]) >= 3]
    if not valid:
        return
    dims = 3
    mins = [min(p["coordinates"][i] for p in valid) for i in range(dims)]
    maxs = [max(p["coordinates"][i] for p in valid) for i in range(dims)]
    center = [(mins[i] + maxs[i]) / 2 for i in range(dims)]
    span = max(maxs[i] - mins[i] for i in range(dims)) or 1.0
    scale = 4.0 / span
    for p in valid:
        p["coordinates"] = [
            float((p["coordinates"][i] - center[i]) * scale) for i in range(dims)
        ]


def vectorize_and_umap(perfumes: list[dict]) -> list[dict]:
    documents = []
    valid = []
    for p in perfumes:
        doc = build_document(p)
        if doc:
            documents.append(doc)
            valid.append(p)
        else:
            print(f"  Skipping (empty doc): {p.get('name')}")

    if len(valid) < 3:
        print(f"  Only {len(valid)} perfumes with text — using simple layout")
        for i, p in enumerate(valid):
            p["coordinates"] = [float(i - len(valid) / 2), 0.0, 0.0]
            p["color"] = brand_color(p["brand"])
        for p in perfumes:
            if "coordinates" not in p:
                p["coordinates"] = [0.0, 0.0, 0.0]
                p["color"] = brand_color(p["brand"])
        return perfumes

    vectorizer = CountVectorizer(max_features=500)
    X = vectorizer.fit_transform(documents)
    n = X.shape[0]
    n_neighbors = min(15, max(2, n - 1))
    reducer = umap.UMAP(n_components=3, random_state=42, n_neighbors=n_neighbors)
    coords = reducer.fit_transform(X.toarray())

    for i, p in enumerate(valid):
        p["coordinates"] = [
            float(coords[i][0]),
            float(coords[i][1]),
            float(coords[i][2]),
        ]
        p["color"] = brand_color(p["brand"])

    for p in perfumes:
        if "coordinates" not in p:
            p["coordinates"] = [0.0, 0.0, 0.0]
            p["color"] = brand_color(p["brand"])

    normalize_coords_list(perfumes)
    return perfumes


def fetch_all_stores(force: bool = False) -> list[dict]:
    if not force and CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, encoding="utf-8") as f:
                cached = json.load(f)
            if cached:
                print(f"Loaded {len(cached)} perfumes from cache ({CACHE_FILE.name})")
                return cached
        except json.JSONDecodeError:
            print("Cache corrupted, refetching...")

    perfumes: list[dict] = []
    for store in STORES:
        domain = store["domain"]
        brand = store["brand"]
        print(f"\nFetching {brand} ({domain})...")
        products = paginate_products(domain)
        perfume_products = [p for p in products if is_perfume_product(p)]
        print(f"  {len(perfume_products)} / {len(products)} passed perfume filter")

        for product in perfume_products:
            norm = normalize_product(product, brand, domain)
            if norm:
                perfumes.append(norm)
            time.sleep(0.15)

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(perfumes, f, indent=2, ensure_ascii=False)
    print(f"\nCached {len(perfumes)} perfumes to {CACHE_FILE.name}")
    return perfumes


def main():
    parser = argparse.ArgumentParser(description="Fetch Shopify perfume catalogs")
    parser.add_argument("--force", action="store_true", help="Ignore cache and refetch")
    args = parser.parse_args()

    perfumes = fetch_all_stores(force=args.force)
    if not perfumes:
        print("No perfumes fetched.")
        return 1

    print(f"\nVectorizing {len(perfumes)} perfumes...")
    perfumes = vectorize_and_umap(perfumes)

    # Strip internal fields for frontend
    output = []
    for p in perfumes:
        output.append(
            {
                "id": p["id"],
                "name": p["name"],
                "brand": p["brand"],
                "gender": p["gender"],
                "topNotes": p.get("topNotes") or [],
                "middleNotes": p.get("middleNotes") or [],
                "baseNotes": p.get("baseNotes") or [],
                "description": p.get("description") or "",
                "mood": p.get("mood") or [],
                "coordinates": p["coordinates"],
                "color": p["color"],
                "url": p.get("url"),
            }
        )

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    by_brand: dict[str, int] = {}
    with_notes = 0
    for p in output:
        by_brand[p["brand"]] = by_brand.get(p["brand"], 0) + 1
        if p["topNotes"] or p["middleNotes"] or p["baseNotes"]:
            with_notes += 1

    print(f"\nWrote {len(output)} perfumes to {OUTPUT_FILE}")
    print("By brand:", by_brand)
    print(f"With note data: {with_notes}/{len(output)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
