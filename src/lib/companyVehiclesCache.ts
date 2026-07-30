/**
 * Short in-memory cache for company vehicle lists shared across dashboard screens.
 * Avoids a full vehicles getDocs/onSnapshot remount cost when navigating between
 * Inspection Proof, Vehicle Reports, and MOT/Tax within a short window.
 * UI behaviour unchanged — only skips redundant network reads.
 */
const TTL_MS = 90_000;

type CacheEntry = {
  at: number;
  vehicles: unknown[];
};

const cache = new Map<string, CacheEntry>();

export function getCachedCompanyVehicles<T>(companyId: string): T[] | null {
  if (!companyId) return null;
  const entry = cache.get(companyId);
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) {
    cache.delete(companyId);
    return null;
  }
  return entry.vehicles as T[];
}

export function setCachedCompanyVehicles(companyId: string, vehicles: unknown[]): void {
  if (!companyId) return;
  cache.set(companyId, { at: Date.now(), vehicles });
}

export const COMPANY_VEHICLES_CACHE_TTL_MS = TTL_MS;
