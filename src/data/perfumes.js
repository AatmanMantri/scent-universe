import scraped from './scrapedPerfumes.json';
import { mockPerfumes } from './mockPerfumes';
import {
  applyPerfumeFilters,
  dedupeById,
  DEFAULT_FILTER_OPTIONS,
  normalizeCoordinates,
} from '../utils/perfumeFilters';

const raw =
  Array.isArray(scraped) && scraped.length > 0 ? scraped : mockPerfumes;

/** Full catalog (deduped, coords normalized). */
export const allPerfumes = normalizeCoordinates(dedupeById(raw));

/** Default subset for Browse, Compare, Find Similar (matches Universe defaults). */
export const perfumes = applyPerfumeFilters(allPerfumes, DEFAULT_FILTER_OPTIONS);
