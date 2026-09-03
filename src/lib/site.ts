import {
  SITE_URL,
  ORGANIZATION_ID,
  WEBSITE_ID,
  SITE_NAME,
  SITE_LEGAL_NAME,
  SUPPORT_EMAIL,
  SALES_EMAIL,
} from '@/lib/brand';

/** Canonical marketing site origin — use for JSON-LD, sitemap, and AI-facing URLs. */
export {
  SITE_URL,
  ORGANIZATION_ID,
  WEBSITE_ID,
  SITE_NAME,
  SITE_LEGAL_NAME,
  SUPPORT_EMAIL,
  SALES_EMAIL,
};

/**
 * Optional comma-separated profile URLs for Organization `sameAs` (e.g. LinkedIn company page).
 * Set via `NEXT_PUBLIC_ORGANIZATION_SAME_AS` in Vercel — omit if none verified yet.
 */
export function getOrganizationSameAs(): string[] {
  const raw = process.env.NEXT_PUBLIC_ORGANIZATION_SAME_AS;
  if (!raw?.trim()) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Path for Next.js `alternates.canonical` / openGraph paths.
 * Matches `trailingSlash: true` in next.config (e.g. `/pricing/`).
 */
export function canonicalPath(path = '/'): string {
  if (!path || path === '/') return '/';
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return normalised.endsWith('/') ? normalised : `${normalised}/`;
}

/**
 * Absolute marketing page URL with trailing slash.
 * Homepage → `https://www.fleettrackpro.co.uk/`
 * `/pricing` → `https://www.fleettrackpro.co.uk/pricing/`
 * File paths (e.g. `/logo.png`) keep their extension and do not gain a slash.
 */
export function absolutePageUrl(pathOrUrl = '/'): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    try {
      const url = new URL(pathOrUrl);
      if (/\.[a-z0-9]+$/i.test(url.pathname)) return url.toString();
      if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`;
      return url.toString();
    } catch {
      return pathOrUrl;
    }
  }

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  if (path === '/') return `${SITE_URL}/`;
  if (/\.[a-z0-9]+$/i.test(path)) return `${SITE_URL}${path}`;
  const trimmed = path.replace(/\/+$/, '');
  return `${SITE_URL}${trimmed}/`;
}
