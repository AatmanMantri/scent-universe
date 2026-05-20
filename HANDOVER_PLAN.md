# Scent Universe - Agent Handover Context

## Current Project Status (V1)
We have successfully built the **V1 React Front-End** and the **V1 Python Scraper**.
The frontend is a 3D visualization using `react-three-fiber` that plots perfumes in a 3D spatial coordinate system, alongside tabs to find similar perfumes and compare their notes.
It is currently using **Mock Data** (`src/data/mockPerfumes.js`) for the UI to allow for rapid frontend development without waiting for scraping.

## The Scraper Issue & Next Steps
The python scraper (`scraper/scrape_and_embed.py`) uses `ScrapeGraphAI` to extract structured JSON (Top/Middle/Base notes) from e-commerce websites and then uses `umap-learn` to mathematically plot them in 3D space.

**Where we left off:**
The user ran the scraper locally using a standard `ollama/llama3` (8B) model. 
However, standard Llama 3 struggles with the massive HTML payloads of the perfume websites. It got overwhelmed, returned blank notes/Unknown names, and eventually froze up on the second run.

**Task for the Next Agent:**
1. **Fix the Scraper Extraction:** You need to work with the user to upgrade the extraction model. You can either:
   - Ask the user to pull a larger local model (`ollama pull llama3.1` or `mistral`) and update the script.
   - Switch the script to use a fast, free cloud API like **Groq** (`llama-3-70b-versatile`) or **Gemini**.
2. **Refine Scraper Prompt:** If the extraction still fails or misses notes, refine the `PROMPT` in `scrape_and_embed.py` or use a custom `ScrapeGraphAI` schema.
3. **Execute & Replace Data:** Once the scraper successfully runs, it will output a `scrapedPerfumes.json` file (thanks to the incremental caching we just added). Your job is to take that JSON, place it in `src/data/`, and update the React components to import the real data instead of the mock data.
4. **Begin V2 (NLP Embeddings):** The user's ultimate goal is to move from simple bag-of-words note matching (V1) to full semantic NLP embeddings (V2). You should update the python script to use HuggingFace `sentence-transformers` to embed the full descriptions/stories of the perfumes, ensuring that scents that "feel" similar (e.g., "dark, smoky") cluster together even if they don't share exact ingredient strings.

## Collaboration Workflow
We are tracking progress through this file.
When you complete a step, please update this `HANDOVER_PLAN.md` file (or use GitHub Issues if the user has pushed this to a remote repo) so that if the user switches laptops again, the next agent knows exactly what was achieved.
