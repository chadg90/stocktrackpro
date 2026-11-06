/**
 * Optional referral-code capture helpers (signup + marketing ?ref=).
 * Never send the code value to analytics.
 */

export const FTP_REF_STORAGE_KEY = 'ftp_ref';
export const FTP_REF_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export type StoredReferral = {
  code: string;
  savedAt: number;
};

/** Strip to A–Z, 0–9, hyphen; upper-case; trim. */
export function normalizeReferralCode(raw: string | null | undefined): string {
  if (!raw) return '';
  return String(raw)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 20);
}

/** Format check for helper hint only — never blocks Continue. */
export function isReferralCodeFormatValid(code: string): boolean {
  if (!code) return true;
  return /^[A-Z0-9-]{3,20}$/.test(code);
}

export function readStoredReferral(now = Date.now()): StoredReferral | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FTP_REF_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredReferral>;
    const code = normalizeReferralCode(parsed.code);
    const savedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : 0;
    if (!code || !savedAt) {
      localStorage.removeItem(FTP_REF_STORAGE_KEY);
      return null;
    }
    if (now - savedAt > FTP_REF_TTL_MS) {
      localStorage.removeItem(FTP_REF_STORAGE_KEY);
      return null;
    }
    return { code, savedAt };
  } catch {
    return null;
  }
}

/**
 * Persist a code if none is stored yet (first code wins).
 * Returns the code that is now stored (existing or newly saved).
 */
export function saveReferralIfFirst(raw: string | null | undefined, now = Date.now()): string | null {
  if (typeof window === 'undefined') return null;
  const code = normalizeReferralCode(raw);
  if (!code) return readStoredReferral(now)?.code ?? null;

  const existing = readStoredReferral(now);
  if (existing) return existing.code;

  try {
    const payload: StoredReferral = { code, savedAt: now };
    localStorage.setItem(FTP_REF_STORAGE_KEY, JSON.stringify(payload));
    return code;
  } catch {
    return code;
  }
}

/** Read ?ref= or ?referral= from a search string / URLSearchParams. */
export function referralCodeFromSearch(search: string | URLSearchParams): string {
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
      : search;
  return normalizeReferralCode(params.get('ref') || params.get('referral') || '');
}

/**
 * Remove ref / referral from the address bar (keep other params e.g. start=1).
 * Call via useLayoutEffect before gtag config / GA events.
 */
export function stripReferralParamsFromLocation(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('ref') && !url.searchParams.has('referral')) return;
    url.searchParams.delete('ref');
    url.searchParams.delete('referral');
    const qs = url.searchParams.toString();
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${qs ? `?${qs}` : ''}${url.hash}`
    );
  } catch {
    /* ignore */
  }
}

export function clearStoredReferral(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FTP_REF_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Scheme constants for admin cash workings (display only — no Stripe payouts). */
export const REFERRAL_COMMISSION_PERCENT = 30;
export const REFERRAL_COMMISSION_MONTHS = 12;
/** Pay day of month (UK). */
export const REFERRAL_PAY_DAY = 15;
/** Confirmed after this many paid subscription months. */
export const REFERRAL_CONFIRM_AFTER_PAID_MONTHS = 2;
