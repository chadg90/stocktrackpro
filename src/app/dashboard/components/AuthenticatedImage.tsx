import React, { useEffect, useRef, useState } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase';
import { Image as ImageIcon } from 'lucide-react';
import {
  storageObjectPathFromDownloadUrl,
  toStorageThumbnailUrl,
} from '@/lib/storageThumbnail';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  /**
   * When true, resolves a `_100x100` Storage path first (Resize Images extension),
   * then falls back to the original `src` if the thumbnail is missing or fails to load.
   */
  preferThumbnail?: boolean;
};

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isFirebaseStorageHost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host.includes('firebasestorage.googleapis.com') ||
      host.includes('storage.googleapis.com') ||
      host.endsWith('.firebasestorage.app')
    );
  } catch {
    return false;
  }
}

/**
 * Prefer direct display for http(s) URLs — avoid CORS-noisy HEAD probes on Storage.
 * Storage object paths are resolved via the Firebase SDK.
 */
async function resolveDownloadUrl(originalSrc: string): Promise<string | null> {
  if (isHttpUrl(originalSrc)) {
    return originalSrc;
  }
  try {
    if (!firebaseApp) return null;
    const storage = getStorage(firebaseApp);
    return await getDownloadURL(ref(storage, originalSrc));
  } catch {
    return null;
  }
}

async function resolveThumbnailUrl(originalSrc: string): Promise<string | null> {
  const thumbCandidate = toStorageThumbnailUrl(originalSrc);
  if (thumbCandidate === originalSrc) return null;

  if (!firebaseApp) return null;
  const storage = getStorage(firebaseApp);

  // Firebase download URLs: probe via SDK getDownloadURL so a missing
  // `_100x100` never becomes an <img> src (avoids console 404s).
  if (isHttpUrl(originalSrc) && isFirebaseStorageHost(originalSrc)) {
    const objectPath = storageObjectPathFromDownloadUrl(originalSrc);
    if (!objectPath) return null;
    const thumbPath = toStorageThumbnailUrl(objectPath);
    if (thumbPath === objectPath) return null;
    try {
      return await getDownloadURL(ref(storage, thumbPath));
    } catch {
      return null;
    }
  }

  if (isHttpUrl(thumbCandidate)) {
    try {
      const response = await fetch(thumbCandidate, { method: 'HEAD' });
      return response.ok ? thumbCandidate : null;
    } catch {
      return null;
    }
  }

  try {
    return await getDownloadURL(ref(storage, thumbCandidate));
  } catch {
    return null;
  }
}

/**
 * AuthenticatedImage — optional Storage refresh / thumbnail.
 * preferThumbnail reduces bandwidth when Resize Images extension is enabled.
 */
export default function AuthenticatedImage({ src, alt, className, preferThumbnail = false }: Props) {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const thumbShownRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    thumbShownRef.current = false;
    setLoading(true);
    setError(false);
    setDisplaySrc(null);

    (async () => {
      if (!src) {
        setLoading(false);
        setError(true);
        return;
      }

      if (preferThumbnail) {
        const thumbUrl = await resolveThumbnailUrl(src);
        if (thumbUrl && !cancelled) {
          thumbShownRef.current = true;
          setDisplaySrc(thumbUrl);
          setLoading(false);
          return;
        }
      }

      const full = await resolveDownloadUrl(src);
      if (cancelled) return;
      if (full) {
        setDisplaySrc(full);
        setLoading(false);
      } else {
        setError(true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src, preferThumbnail]);

  const handleImgError = () => {
    void (async () => {
      if (!src) {
        setError(true);
        return;
      }
      if (preferThumbnail && thumbShownRef.current) {
        thumbShownRef.current = false;
        setLoading(true);
        const full = await resolveDownloadUrl(src);
        if (full) {
          setDisplaySrc(full);
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
        return;
      }
      setError(true);
    })();
  };

  if (loading) {
    return <div className={`animate-pulse bg-white/10 ${className ?? ''}`} />;
  }

  if (error || !displaySrc) {
    return (
      <div className={`flex items-center justify-center bg-white/5 text-white/30 ${className ?? ''}`}>
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={displaySrc} alt={alt} className={className} onError={handleImgError} />;
}
