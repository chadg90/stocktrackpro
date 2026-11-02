/** Google Analytics 4 + Consent Mode helpers (marketing pages only). */

export const GA_CONSENT_STORAGE_KEY = 'ftp_consent';
export const LEGACY_COOKIE_CONSENT_KEY = 'cookieConsent';
export const OPEN_COOKIE_SETTINGS_EVENT = 'ftp:open-cookie-settings';

export type AnalyticsConsentValue = 'granted' | 'denied';

export type FtpConsent = {
  analytics: AnalyticsConsentValue;
  v: 2;
  at: string;
};

/** Query params stripped from page_location before sending to GA. */
const PII_QUERY_PARAMS = new Set([
  'email',
  'name',
  'phone',
  'token',
  'oobCode',
  'apiKey',
  'ref',
  'referral',
]);

/** Paths where gtag must not load and page_view must not fire. */
const EXCLUDED_PATH_PREFIXES = [
  '/dashboard',
  '/onboarding',
  '/invite',
  '/return',
  '/api',
] as const;

export function getGaId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim();
  return id || undefined;
}

export function normalizePathname(pathname: string): string {
  if (!pathname) return '/';
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function isAnalyticsExcludedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = normalizePathname(pathname);
  return EXCLUDED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

export function stripPiiFromUrl(href: string): string {
  try {
    const url = new URL(href);
    for (const key of [...url.searchParams.keys()]) {
      if (PII_QUERY_PARAMS.has(key)) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch {
    return href;
  }
}

export function readFtpConsent(): FtpConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GA_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FtpConsent>;
    if (
      parsed?.v === 2 &&
      (parsed.analytics === 'granted' || parsed.analytics === 'denied') &&
      typeof parsed.at === 'string'
    ) {
      return { analytics: parsed.analytics, v: 2, at: parsed.at };
    }
  } catch {
    // ignore
  }
  return null;
}

export function writeFtpConsent(analytics: AnalyticsConsentValue): FtpConsent {
  const value: FtpConsent = {
    analytics,
    v: 2,
    at: new Date().toISOString(),
  };
  try {
    localStorage.setItem(GA_CONSENT_STORAGE_KEY, JSON.stringify(value));
    localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
  } catch {
    // ignore storage failures
  }
  return value;
}

export function clearLegacyCookieConsent(): void {
  try {
    localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
  } catch {
    // ignore
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function updateAnalyticsConsent(analytics: AnalyticsConsentValue): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', { analytics_storage: analytics });
}
