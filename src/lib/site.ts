/** Canonical marketing site origin — use for JSON-LD, sitemap, and AI-facing URLs. */
export {
  SITE_URL,
  ORGANIZATION_ID,
  WEBSITE_ID,
  SITE_NAME,
  SITE_LEGAL_NAME,
  SUPPORT_EMAIL,
  SALES_EMAIL,
} from '@/lib/brand';

/**
 * Optional comma-separated profile URLs for Organization `sameAs` (e.g. LinkedIn company page).
 * Set via `NEXT_PUBLIC_ORGANIZATION_SAME_AS` in Vercel — omit if none verified yet.
 */
export function getOrganizationSameAs(): string[] {
  const raw = process.env.NEXT_PUBLIC_ORGANIZATION_SAME_AS;
  if (!raw?.trim()) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
