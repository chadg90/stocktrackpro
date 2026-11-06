/**
 * Firebase "Resize Images" extension often writes resized objects by inserting
 * `_{width}x{height}` before the file extension, e.g. `photo_100x100.jpg`.
 */
const THUMB_SIZE = '100x100';

export function toStorageThumbnailUrl(fullUrl: string, size: string = THUMB_SIZE): string {
  if (!fullUrl || typeof fullUrl !== 'string') return fullUrl;

  const lower = fullUrl.toLowerCase();
  if (lower.includes(`_${size.toLowerCase()}.`)) return fullUrl;

  const qIdx = fullUrl.indexOf('?');
  const base = qIdx >= 0 ? fullUrl.slice(0, qIdx) : fullUrl;
  const query = qIdx >= 0 ? fullUrl.slice(qIdx) : '';

  const re = /\.(jpe?g|png|webp)$/i;
  if (!re.test(base)) return fullUrl;

  return base.replace(re, `_${size}.$1`) + query;
}

/**
 * Extract a Storage object path from a Firebase download URL, or null if not parseable.
 * Used so thumbnail existence can be checked via getDownloadURL (no img 404).
 */
export function storageObjectPathFromDownloadUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    // https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encodedPath>?...
    const legacy = u.pathname.match(/\/v0\/b\/[^/]+\/o\/(.+)$/);
    if (legacy?.[1]) return decodeURIComponent(legacy[1]);
    // https://storage.googleapis.com/<bucket>/<path>
    if (u.hostname === 'storage.googleapis.com') {
      const parts = u.pathname.replace(/^\//, '').split('/');
      if (parts.length >= 2) return decodeURIComponent(parts.slice(1).join('/'));
    }
    return null;
  } catch {
    return null;
  }
}
