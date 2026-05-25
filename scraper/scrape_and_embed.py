import json
import os
import argparse
from scrapegraphai.graphs import SmartScraperGraph
from sklearn.feature_extraction.text import CountVectorizer
import umap
from dotenv import load_dotenv

"""
DEPRECATED — use fetch_shopify.py instead (Shopify JSON, no LLM).

PERFUME UNIVERSE SCRAPER & VECTORIZER (V1 - Notes Based)

Dependencies required:
pip install scrapegraphai playwright umap-learn scikit-learn
playwright install

Usage:
1. Set OPENAI_API_KEY environment variable.
2. Run: python scrape_and_embed.py
"""

# URLs to scrape (can be product pages or collection pages if using MultiGraph)
TARGET_URLS = [
    "https://fraganote.com/products/persian-oud-50ml",
    "https://houseofkanzan.com/products/221b",
    "https://www.houseofem5.com/collections/all",
    "https://rivona.in/collections/moods-by-rivona"
]

PROMPT = """
Extract detailed perfume information from this product page.
Return a JSON object with the following schema:
{
    "id": "A unique slugified identifier based on brand and name (e.g. brand-name)",
    "name": "The name of the perfume",
    "brand": "The brand or company name",
    "gender": "Men, Women, or Unisex",
    "topNotes": ["List", "of", "top", "notes"],
    "middleNotes": ["List", "of", "middle", "or", "heart", "notes"],
    "baseNotes": ["List", "of", "base", "notes"],
    "description": "A short 1-2 sentence description of the scent or story",
    "mood": ["List", "of", "3", "adjectives", "describing", "the", "vibe"]
}
If top/middle/base notes are not explicitly separated, try your best to categorize them based on standard perfume knowledge, or put them all in middleNotes if unsure.
"""

def scrape_perfume(url):
    print(f"Scraping: {url}...")
    
    graph_config = {
        "llm": {
            "model": "ollama/llama3",
            "format": "json"
        },
        "verbose": False,
        "headless": True,
    }

    scraper = SmartScraperGraph(
        prompt=PROMPT,
        source=url,
        config=graph_config
    )

    try:
        result = scraper.run()
        return result
    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return None

def vectorize_and_umap(perfumes):
    print("\nVectorizing and applying UMAP...")
    print(f"Total perfumes scraped: {len(perfumes)}")
    
    # 1. Combine notes into a single text string per perfume
    documents = []
    valid_perfumes = []
    
    for p in perfumes:
        # Some LLMs return None instead of an empty list, so we default to []
        top = p.get('topNotes') or []
        mid = p.get('middleNotes') or []
        base = p.get('baseNotes') or []
        
        # Make sure they are lists of strings
        notes = [str(n) for n in top + mid + base if n]
        doc = " ".join(notes).strip()
        
        print(f"Found notes for {p.get('name', 'Unknown')}: {doc}")
        
        if doc:
            documents.append(doc)
            valid_perfumes.append(p)
        else:
            print(f"Skipping {p.get('name', 'Unknown')} because no notes were found.")
            
    if not documents:
        print("Error: No notes extracted from any of the perfumes. Cannot vectorize.")
        return perfumes
        
    # 2. Bag of words vectorization
    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(documents)
    
    # 3. UMAP to 3D
    reducer = umap.UMAP(n_components=3, random_state=42)
    coords = reducer.fit_transform(X.toarray())
    
    # 4. Append back to JSON
    for i, p in enumerate(perfumes):
        p['coordinates'] = [float(coords[i][0]), float(coords[i][1]), float(coords[i][2])]
        p['color'] = "#B8860B" # Default gold for light mode
        
    return perfumes

CACHE_FILE = "raw_scraped_data.json"

def main():
    print("Starting local scraping with Ollama...")
    
    # Load existing cache if it exists
    all_perfumes = []
    scraped_urls = set()
    
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            try:
                all_perfumes = json.load(f)
                scraped_urls = {p.get("url") for p in all_perfumes if p.get("url")}
                print(f"Loaded {len(all_perfumes)} perfumes from cache.")
            except json.JSONDecodeError:
                print("Cache file corrupted, starting fresh.")
                all_perfumes = []

    for url in TARGET_URLS:
        if url in scraped_urls:
            print(f"Skipping {url} (already cached)")
            continue
            
        data = scrape_perfume(url)
        if data:
            # Tag the data with the URL so we know we scraped it
            data["url"] = url
            all_perfumes.append(data)
            
            # Save immediately to disk after each successful scrape
            with open(CACHE_FILE, "w") as f:
                json.dump(all_perfumes, f, indent=2)
            
    if not all_perfumes:
        print("No data available to process.")
        return
        
    processed_perfumes = vectorize_and_umap(all_perfumes)
    
    output_path = os.path.join("..", "src", "data", "scrapedPerfumes.json")
    with open(output_path, "w") as f:
        json.dump(processed_perfumes, f, indent=2)
        
    print(f"\nSuccessfully saved {len(processed_perfumes)} perfumes to {output_path}")
    print("You can now import this JSON in your React app instead of the mock data!")

if __name__ == "__main__":
    main()
