/** Google Analytics 4 + Consent Mode helpers (marketing pages only). */

export const GA_CONSENT_STORAGE_KEY = 'ftp_consent';
export const LEGACY_COOKIE_CONSENT_KEY = 'cookieConsent';
export const OPEN_COOKIE_SETTINGS_EVENT = 'ftp:open-cookie-settings';
/** Fired after ftp_consent is written (Accept or Reject). */
export const FTP_CONSENT_CHANGED_EVENT = 'ftp:consent-changed';
/** Fired once gtag.js is loaded and configured after Accept. */
export const FTP_ANALYTICS_READY_EVENT = 'ftp:analytics-ready';
export const GA_SIGN_UP_SESSION_KEY = 'ftp_ga_sign_up';
/** Queued if Start free trial happens before Accept / gtag ready. */
export const GA_BEGIN_SIGNUP_QUEUED_KEY = 'ftp_ga_begin_signup_queued';
const GTAG_SCRIPT_ID = 'ftp-gtag-js';

export type AnalyticsConsentValue = 'granted' | 'denied';

export type FtpConsent = {
  analytics: AnalyticsConsentValue;
  v: 2;
  at: string;
};

export type WhatsAppTrackLocation =
  | 'hero'
  | 'header'
  | 'contact'
  | 'footer'
  | 'pricing'
  | 'floating';

export type WhatsAppTrackIntent = 'demo' | 'support';

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
  'promo',
  'invite',
]);

/** Drop event params whose keys look like personal data. */
const PII_PARAM_KEY = /email|name|phone|company|uid|user|code|message/i;

/** Paths where automatic page_view must not fire. */
const PAGE_VIEW_EXCLUDED_PREFIXES = [
  '/dashboard',
  '/onboarding',
  '/invite',
  '/return',
  '/api',
] as const;

/** Paths where the cookie banner is hidden (onboarding still shows Accept / Reject). */
const COOKIE_BANNER_HIDDEN_PREFIXES = [
  '/dashboard',
  '/invite',
  '/return',
  '/api',
] as const;

/** Paths where the gtag.js snippet must not load at all. */
const GTAG_BLOCKED_PREFIXES = ['/dashboard', '/api'] as const;

export function getGaId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim();
  return id || undefined;
}

/** Opens Google Analytics (admin dashboard deep-link). Free GA4 property home. */
export const GA_ADMIN_URL = 'https://analytics.google.com/';

export function normalizePathname(pathname: string): string {
  if (!pathname) return '/';
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function pathMatchesPrefix(
  pathname: string | null | undefined,
  prefixes: readonly string[]
): boolean {
  if (!pathname) return false;
  const path = normalizePathname(pathname);
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** Automatic page_view exclusions (includes onboarding). */
export function isAnalyticsExcludedPath(pathname: string | null | undefined): boolean {
  return pathMatchesPrefix(pathname, PAGE_VIEW_EXCLUDED_PREFIXES);
}

/** Hide cookie banner on product / auth flows — not on /onboarding/. */
export function isCookieBannerHiddenPath(pathname: string | null | undefined): boolean {
  return pathMatchesPrefix(pathname, COOKIE_BANNER_HIDDEN_PREFIXES);
}

/** Do not load gtag on the signed-in product or APIs. */
export function isGtagBlockedPath(pathname: string | null | undefined): boolean {
  return pathMatchesPrefix(pathname, GTAG_BLOCKED_PREFIXES);
}

export function isDashboardPath(pathname: string | null | undefined): boolean {
  return pathMatchesPrefix(pathname, ['/dashboard']);
}

export function isOnboardingPath(pathname: string | null | undefined): boolean {
  return pathMatchesPrefix(pathname, ['/onboarding']);
}

/** True once gtag.js has loaded (not the pre-load stub). */
export function isGtagReady(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.gtag !== 'function') return false;
  const script = document.getElementById(GTAG_SCRIPT_ID);
  return script?.getAttribute('data-loaded') === '1';
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

/** Onboarding GA page_location: origin + pathname only (no query, including start=1). */
export function stripAllQueryFromUrl(href: string): string {
  try {
    const url = new URL(href);
    return `${url.origin}${url.pathname}`;
  } catch {
    return href;
  }
}

/** page_location for GA: onboarding drops every query param; elsewhere strip PII keys only. */
export function pageLocationForGa(href?: string): string {
  if (typeof window === 'undefined' && !href) return '';
  const value = href ?? (typeof window !== 'undefined' ? window.location.href : '');
  try {
    const path = new URL(value).pathname;
    if (isOnboardingPath(path)) return stripAllQueryFromUrl(value);
  } catch {
    /* fall through */
  }
  return stripPiiFromUrl(value);
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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(FTP_CONSENT_CHANGED_EVENT, { detail: { analytics } })
    );
  }
  return value;
}

/** True when the visitor has Accept’d analytics (gtag may load). */
export function hasAnalyticsConsent(): boolean {
  return readFtpConsent()?.analytics === 'granted';
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
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: analytics });
  }
  // After Reject, drop the gtag script so DevTools shows no further Google requests.
  if (analytics === 'denied') {
    document.getElementById('ftp-gtag-js')?.remove();
    window.gtag = undefined;
    try {
      sessionStorage.removeItem(GA_BEGIN_SIGNUP_QUEUED_KEY);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Send a manual page_view for the current URL (gtag config uses send_page_view: false).
 * No-ops until Accept has loaded gtag.js (script#ftp-gtag-js[data-loaded]).
 */
export function sendCurrentPageView(): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (!isGtagReady() || typeof window.gtag !== 'function') return;
  if (isAnalyticsExcludedPath(window.location.pathname)) return;
  emitPageView();
}

/**
 * Onboarding is excluded from automatic page_view. After Accept, send one hit
 * once gtag is ready (page_location without ref / referral).
 */
export function sendOnboardingPageViewIfAllowed(): void {
  if (typeof window === 'undefined') return;
  if (!isOnboardingPath(window.location.pathname)) return;
  if (!hasAnalyticsConsent()) return;
  if (!isGtagReady() || typeof window.gtag !== 'function') return;
  emitPageView();
}

function emitPageView(): void {
  if (typeof window.gtag !== 'function') return;
  const page_location = pageLocationForGa(window.location.href);
  let page_path = `${window.location.pathname}${window.location.search}`;
  try {
    const stripped = new URL(page_location);
    page_path = `${stripped.pathname}${stripped.search}`;
  } catch {
    /* keep page_path */
  }
  window.gtag('event', 'page_view', {
    page_location,
    page_path,
    page_title: document.title,
  });
}

export function queueBeginSignup(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(GA_BEGIN_SIGNUP_QUEUED_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** Send queued begin_signup after Accept + gtag ready. No-ops if none queued or Reject. */
export function flushQueuedBeginSignup(): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  let queued = false;
  try {
    queued = sessionStorage.getItem(GA_BEGIN_SIGNUP_QUEUED_KEY) === '1';
    if (queued) sessionStorage.removeItem(GA_BEGIN_SIGNUP_QUEUED_KEY);
  } catch {
    return;
  }
  if (!queued) return;
  track('begin_signup', {
    source_path: referrerSourcePath(),
    page_location: pageLocationForGa(window.location.href),
  });
}

function sanitizeTrackParams(
  params?: Record<string, unknown>
): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (PII_PARAM_KEY.test(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Fire a GA4 event when analytics consent allows it.
 * No-ops on the server and on /dashboard/** (Consent Mode still suppresses when denied).
 */
export function track(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (isDashboardPath(window.location.pathname)) return;
  if (!hasAnalyticsConsent()) return;
  if (typeof window.gtag !== 'function') return;
  if (!eventName || typeof eventName !== 'string') return;

  const safe = sanitizeTrackParams(params);
  if (safe) {
    window.gtag('event', eventName, safe);
  } else {
    window.gtag('event', eventName);
  }
}

export function referrerSourcePath(): string {
  if (typeof document === 'undefined') return 'direct';
  try {
    if (!document.referrer) return 'direct';
    const path = new URL(document.referrer).pathname;
    return path || 'direct';
  } catch {
    return 'direct';
  }
}

/** True when a referral/promo query is present — never send the code value. */
export function signupHasReferralFlag(search: string | URLSearchParams): boolean {
  const params =
    typeof search === 'string' ? new URLSearchParams(search.startsWith('?') ? search : `?${search}`) : search;
  return Boolean(
    params.get('ref') ||
      params.get('referral') ||
      params.get('promo') ||
      params.get('invite')
  );
}
