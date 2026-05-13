/** Canonical marketing site origin — use for JSON-LD, sitemap, and AI-facing URLs. */
export const SITE_URL = 'https://www.stocktrackpro.co.uk';

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Optional comma-separated profile URLs for Organization `sameAs` (e.g. LinkedIn company page).
 * Set via `NEXT_PUBLIC_ORGANIZATION_SAME_AS` in Vercel — omit if none verified yet.
 */
export function getOrganizationSameAs(): string[] {
  const raw = process.env.NEXT_PUBLIC_ORGANIZATION_SAME_AS;
  if (!raw?.trim()) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
