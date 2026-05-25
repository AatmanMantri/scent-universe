/** Client-side filters — adjust after visual QA without re-scraping. */

export function hasNotes(perfume) {
  return (
    (perfume.topNotes?.length ?? 0) +
      (perfume.middleNotes?.length ?? 0) +
      (perfume.baseNotes?.length ?? 0) >
    0
  );
}

export function isGiftOrSample(perfume) {
  const blob = `${perfume.name} ${perfume.description || ''}`.toLowerCase();
  return /\b(gift set|sample set|sample pack|free gift|surprise gift|customise|customize|explorer's gift|experience sample|buy any|combo pack|bundle of|chapter ii - sample)\b/.test(
    blob
  );
}

export function isNonPerfumeAccessory(perfume) {
  const blob = `${perfume.name} ${perfume.description || ''}`.toLowerCase();
  return /\b(beard balm|car perfume|foot spray|solid perfume|deodorant)\b/.test(blob);
}

/** Same defaults as the Universe tab on first load. */
export const DEFAULT_FILTER_OPTIONS = {
  brands: [],
  hideGifts: true,
  hideAccessories: true,
  requireNotes: false,
};

export function applyPerfumeFilters(
  perfumes,
  {
    brands = [],
    hideGifts = DEFAULT_FILTER_OPTIONS.hideGifts,
    hideAccessories = DEFAULT_FILTER_OPTIONS.hideAccessories,
    requireNotes = DEFAULT_FILTER_OPTIONS.requireNotes,
  } = {}
) {
  return perfumes.filter((p) => {
    if (brands.length > 0 && !brands.includes(p.brand)) return false;
    if (hideGifts && isGiftOrSample(p)) return false;
    if (hideAccessories && isNonPerfumeAccessory(p)) return false;
    if (requireNotes && !hasNotes(p)) return false;
    return true;
  });
}

/** Center and scale UMAP coords into roughly [-2, 2] for the default camera. */
export function normalizeCoordinates(perfumes) {
  if (!perfumes.length) return perfumes;

  const dims = 3;
  const mins = Array(dims).fill(Infinity);
  const maxs = Array(dims).fill(-Infinity);

  for (const p of perfumes) {
    const c = p.coordinates;
    if (!c || c.length < dims) continue;
    for (let i = 0; i < dims; i++) {
      mins[i] = Math.min(mins[i], c[i]);
      maxs[i] = Math.max(maxs[i], c[i]);
    }
  }

  const scale = Math.max(
    ...mins.map((min, i) => {
      const span = maxs[i] - min;
      return span > 0 ? 4 / span : 1;
    })
  );

  const center = mins.map((min, i) => (min + maxs[i]) / 2);

  return perfumes.map((p) => {
    if (!p.coordinates) return p;
    const coords = p.coordinates.map((v, i) => (v - center[i]) * scale);
    return { ...p, coordinates: coords };
  });
}

export function dedupeById(perfumes) {
  const seen = new Set();
  return perfumes.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}
