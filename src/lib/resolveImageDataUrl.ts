import { getBytes, getStorage, ref } from 'firebase/storage';
import { firebaseApp, firebaseAuth } from '@/lib/firebase';

const DEFAULT_TIMEOUT_MS = 20000;
const MAX_EMBED_EDGE_PX = 640;
const JPEG_QUALITY = 0.68;
/** Client getBytes has been hanging in this app — never wait longer than this. */
const SDK_ATTEMPT_MS = 2500;

/**
 * Load an image for PDF embedding.
 * Prefers the authenticated /api/storage/object proxy (Admin SDK) so we avoid
 * browser CORS and client getBytes hangs, then compresses for fast jsPDF use.
 */
export type ResolvedImage = {
  dataUrl: string;
  format: 'JPEG' | 'PNG';
  width: number;
  height: number;
};

export async function resolveImageDataUrl(
  value: string | null | undefined,
  opts?: { timeoutMs?: number; maxEdgePx?: number }
): Promise<ResolvedImage | null> {
  if (value == null || String(value).trim() === '') return null;
  const v = String(value).trim();
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxEdgePx = opts?.maxEdgePx ?? MAX_EMBED_EDGE_PX;

  try {
    const blob = await withTimeout(
      loadBlob(v, { prefer: 'api' }),
      timeoutMs,
      `image load timed out (${timeoutMs}ms)`
    );
    if (!blob || blob.size === 0) return null;

    return await withTimeout(
      compressImageBlob(blob, maxEdgePx),
      Math.min(timeoutMs, 8000),
      'image compress timed out'
    );
  } catch (err) {
    console.warn('[resolveImageDataUrl] failed', v.slice(0, 120), err);
    return null;
  }
}

/**
 * Download raw Storage object bytes for ZIP packs.
 * Uses signed URLs (fast) — never waits on hanging client getBytes.
 */
export async function fetchStorageBytes(
  value: string | null | undefined,
  opts?: { timeoutMs?: number }
): Promise<Uint8Array | null> {
  if (value == null || String(value).trim() === '') return null;
  const v = String(value).trim();
  const timeoutMs = opts?.timeoutMs ?? 25000;
  try {
    const blob = await withTimeout(
      loadBlob(v, { prefer: 'signed' }),
      timeoutMs,
      `storage download timed out (${timeoutMs}ms)`
    );
    if (!blob || blob.size === 0) return null;
    return new Uint8Array(await blob.arrayBuffer());
  } catch (err) {
    console.warn('[fetchStorageBytes] failed', v.slice(0, 120), err);
    return null;
  }
}

/** Run async work over items with a fixed concurrency limit. */
export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(concurrency, Math.max(items.length, 1)) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

async function loadBlob(
  v: string,
  opts: { prefer: 'api' | 'signed' }
): Promise<Blob | null> {
  // Public/local site assets — never send these to Firebase Storage.
  if (isLocalAssetPath(v)) {
    try {
      const res = await fetch(v);
      if (res.ok) return await res.blob();
    } catch {
      /* ignore */
    }
    return null;
  }

  const objectPath = toStorageObjectPath(v);

  const trySignedUrl = async (): Promise<Blob | null> => {
    if (!objectPath) return null;
    const signed = await getSignedStorageUrl(objectPath);
    if (!signed) return null;
    try {
      const res = await fetch(signed);
      if (res.ok) return await res.blob();
    } catch {
      /* fall through */
    }
    return null;
  };

  const tryApiBytes = async (): Promise<Blob | null> => {
    if (!objectPath) return null;
    return loadViaStorageApi(objectPath);
  };

  const trySdkShort = async (): Promise<Blob | null> => {
    if (!objectPath || !firebaseApp) return null;
    try {
      const bytes = await withTimeout(
        getBytes(ref(getStorage(firebaseApp), objectPath)),
        SDK_ATTEMPT_MS,
        'getBytes timed out'
      );
      if (bytes?.byteLength) return new Blob([bytes], { type: guessMime(objectPath) });
    } catch {
      /* fall through */
    }
    return null;
  };

  if (opts.prefer === 'signed') {
    // Packs: signed URL first (large PDFs), then small proxy, brief SDK last.
    return (await trySignedUrl()) || (await tryApiBytes()) || (await trySdkShort());
  }

  // PDF images: byte proxy first, then signed URL, brief SDK last.
  return (await tryApiBytes()) || (await trySignedUrl()) || (await trySdkShort());
}

function isLocalAssetPath(v: string): boolean {
  if (v.startsWith('/')) return true;
  if (typeof window !== 'undefined' && v.startsWith(window.location.origin)) return true;
  return false;
}

async function getSignedStorageUrl(objectPath: string): Promise<string | null> {
  if (typeof window === 'undefined' || !firebaseAuth?.currentUser) return null;
  try {
    const token = await firebaseAuth.currentUser.getIdToken();
    const res = await fetch(
      `/api/storage/object?path=${encodeURIComponent(objectPath)}&sign=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return typeof data.url === 'string' && data.url ? data.url : null;
  } catch {
    return null;
  }
}

async function loadViaStorageApi(objectPath: string): Promise<Blob | null> {
  if (typeof window === 'undefined' || !firebaseAuth?.currentUser) return null;
  try {
    const token = await firebaseAuth.currentUser.getIdToken();
    const res = await fetch(`/api/storage/object?path=${encodeURIComponent(objectPath)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

function toStorageObjectPath(v: string): string | null {
  if (isLocalAssetPath(v)) return null;
  if (!/^https?:\/\//i.test(v) && !v.startsWith('gs://')) {
    const path = v.replace(/^\/+/, '');
    if (!path || path.includes('..')) return null;
    return path;
  }
  if (v.startsWith('gs://')) {
    return decodeURIComponent(v.replace(/^gs:\/\/[^/]+\//, '')) || null;
  }
  return firebaseStorageObjectPathFromUrl(v);
}

async function compressImageBlob(blob: Blob, maxEdgePx: number): Promise<ResolvedImage | null> {
  if (blob.size > 0 && blob.size < 30_000 && blob.type === 'image/png') {
    const dims = await readImageDims(blob);
    const dataUrl = await blobToDataUrl(blob);
    if (!dataUrl || !dims) return null;
    return { dataUrl, format: 'PNG', width: dims.width, height: dims.height };
  }

  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxEdgePx / Math.max(bitmap.width, bitmap.height, 1));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      const dataUrl = await blobToDataUrl(blob);
      return dataUrl
        ? {
            dataUrl,
            format: blob.type.includes('png') ? 'PNG' : 'JPEG',
            width: bitmap.width,
            height: bitmap.height,
          }
        : null;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    return dataUrl ? { dataUrl, format: 'JPEG', width, height } : null;
  } catch {
    const dims = await readImageDims(blob);
    const dataUrl = await blobToDataUrl(blob);
    if (!dataUrl || !dims) return null;
    return {
      dataUrl,
      format: blob.type.includes('png') ? 'PNG' : 'JPEG',
      width: dims.width,
      height: dims.height,
    };
  }
}

function readImageDims(blob: Blob): Promise<{ width: number; height: number } | null> {
  return createImageBitmap(blob)
    .then((bitmap) => {
      const dims = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dims;
    })
    .catch(() => null);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function guessMime(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'image/jpeg';
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function firebaseStorageObjectPathFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/o\/(.+)$/);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
