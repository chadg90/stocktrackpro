/**
 * Client-side throttle for Road Movement Order PDF generation.
 * Prevents rapid re-downloads / spam clicks.
 */

const COOLDOWN_MS = 20_000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const STORAGE_KEY = 'ftp_rmo_pdf_rate_v1';

type RateState = {
  lastAt: number;
  windowStart: number;
  count: number;
};

function readState(): RateState {
  if (typeof window === 'undefined') {
    return { lastAt: 0, windowStart: Date.now(), count: 0 };
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { lastAt: 0, windowStart: Date.now(), count: 0 };
    const parsed = JSON.parse(raw) as Partial<RateState>;
    return {
      lastAt: Number(parsed.lastAt) || 0,
      windowStart: Number(parsed.windowStart) || Date.now(),
      count: Number(parsed.count) || 0,
    };
  } catch {
    return { lastAt: 0, windowStart: Date.now(), count: 0 };
  }
}

function writeState(state: RateState): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export type RmoPdfRateResult =
  | { ok: true }
  | { ok: false; message: string; retryAfterSec: number };

/** Returns whether another PDF generation is allowed right now. */
export function checkRmoPdfRateLimit(): RmoPdfRateResult {
  const now = Date.now();
  let state = readState();
  if (now - state.windowStart >= WINDOW_MS) {
    state = { lastAt: state.lastAt, windowStart: now, count: 0 };
  }

  const sinceLast = now - state.lastAt;
  if (state.lastAt > 0 && sinceLast < COOLDOWN_MS) {
    const retryAfterSec = Math.ceil((COOLDOWN_MS - sinceLast) / 1000);
    return {
      ok: false,
      retryAfterSec,
      message: `Please wait ${retryAfterSec}s before generating another PDF.`,
    };
  }

  if (state.count >= MAX_PER_WINDOW) {
    const retryAfterSec = Math.ceil((state.windowStart + WINDOW_MS - now) / 1000);
    return {
      ok: false,
      retryAfterSec,
      message: `PDF limit reached (${MAX_PER_WINDOW} per hour). Try again later.`,
    };
  }

  return { ok: true };
}

/** Call after a successful PDF generation. */
export function recordRmoPdfGeneration(): void {
  const now = Date.now();
  let state = readState();
  if (now - state.windowStart >= WINDOW_MS) {
    state = { lastAt: 0, windowStart: now, count: 0 };
  }
  state.lastAt = now;
  state.count += 1;
  writeState(state);
}
