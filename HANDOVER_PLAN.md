# Scent Universe - Agent Handover Context

## V1 shipped

**React UI** — Universe (3D), Find Similar, Compare, Browse.

**Data** — Shopify JSON scraper (no LLM), ~314 perfumes in `src/data/scrapedPerfumes.json`.

**Default filters** (Browse / Compare / Find Similar + Universe on load):

- Hide gifts and sample sets
- Hide accessories (beard balm, car perfume, etc.)
- All brands enabled; “require notes” off

Universe can relax filters to see the full catalog (~314). Layout uses bag-of-words + UMAP on note/description text — not semantic “vibe” AI.

## How to refresh data

```bash
cd scent-universe
source venv/bin/activate
pip install -r scraper/requirements.txt
python scraper/fetch_shopify.py
python scraper/fetch_shopify.py --force
```

**Stores:** fraganote.com, houseofkanzan.com, www.houseofem5.com, rivona.in

**Kanzan notes:** parsed from product HTML (`First Impression` / `The Heart` / `The Sillage`).

## Key files

| File | Role |
|------|------|
| [scraper/fetch_shopify.py](scraper/fetch_shopify.py) | Fetch, parse, UMAP, write JSON |
| [src/data/scrapedPerfumes.json](src/data/scrapedPerfumes.json) | Generated catalog |
| [src/data/perfumes.js](src/data/perfumes.js) | `allPerfumes` + default-filtered `perfumes` |
| [src/utils/perfumeFilters.js](src/utils/perfumeFilters.js) | Client filters + coord normalize |
| [src/components/PerfumePicker.jsx](src/components/PerfumePicker.jsx) | Searchable Compare picker |

## Deprecated

- [scraper/scrape_and_embed.py](scraper/scrape_and_embed.py) — ScrapeGraphAI + Ollama; do not use

## V2 (deferred)

- `sentence-transformers` + `--semantic` UMAP
- `--force` re-scrape after tighter `EXCLUDE_RE`
- Rivona collection-specific URL
- Shared filter state in App header (optional)

## Collaboration

Update this file after major data or architecture changes.
