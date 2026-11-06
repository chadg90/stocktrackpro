/** Session-scoped profile role cache — avoids AdminGate / sidebar flash. */

const STORAGE_KEY = 'ftp_profile_role';

type CachedRole = {
  uid: string;
  role: string;
};

function readCache(): CachedRole | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRole;
    if (!parsed?.uid || typeof parsed.role !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Cached role for this uid in the current browser session, if any. */
export function getCachedProfileRole(uid: string): string | null {
  const cached = readCache();
  if (!cached || cached.uid !== uid) return null;
  return cached.role;
}

export function setCachedProfileRole(uid: string, role: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ uid, role }));
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function clearCachedProfileRole(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
