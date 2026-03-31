import { FirebaseStorage, getDownloadURL, getStorage, ref } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase';

const pathCache = new Map<string, string>();

/** Legacy https URL → unchanged. Storage object path → getDownloadURL (Web SDK). */
export async function getImageUrl(
  storage: FirebaseStorage,
  value: string | null | undefined
): Promise<string | null> {
  if (value == null || value === '') return null;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v)) return v;
  return getDownloadURL(ref(storage, v));
}

export async function getImageUrlCached(
  storage: FirebaseStorage,
  value: string | null | undefined
): Promise<string | null> {
  if (value == null || value === '') return null;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (pathCache.has(v)) return pathCache.get(v) ?? null;
  const url = await getImageUrl(storage, v);
  if (url) pathCache.set(v, url);
  return url;
}

/** Use when you only have the default app (browser). */
export async function getImageUrlFromApp(
  value: string | null | undefined
): Promise<string | null> {
  if (!firebaseApp) return null;
  return getImageUrlCached(getStorage(firebaseApp), value);
}
