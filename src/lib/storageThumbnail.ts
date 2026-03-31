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
