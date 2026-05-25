# Scent Universe

Explore perfumes from Indian niche brands in a 3D scent space. Compare notes, find similar scents, and browse catalogs scraped from Shopify stores.

## Quick start

```bash
cd scent-universe
npm install
npm run dev
```

Open http://localhost:5173

## Refresh catalog data

Requires Python 3 and the project venv:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r scraper/requirements.txt
python scraper/fetch_shopify.py          # uses cache
python scraper/fetch_shopify.py --force  # full re-fetch
```

Output: `src/data/scrapedPerfumes.json` (Fraganote, House of Kanzan, House of EM5, Rivona).

No API keys required.

## Tabs

- **Universe** — 3D map (UMAP from note/description text). Filters in the top-right panel.
- **Find Similar** — nearest neighbors by spatial distance in the map.
- **Compare** — shared vs unique notes between two perfumes.
- **Browse** — grid with brand filters.

Browse, Compare, and Find Similar use the same default filters as Universe (hide gifts/samples and accessories). Universe can show the full catalog when those filters are turned off.

## More context

See [HANDOVER_PLAN.md](HANDOVER_PLAN.md) for architecture, caveats, and V2 ideas (semantic embeddings).
