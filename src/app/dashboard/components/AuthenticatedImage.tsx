import React, { useEffect, useRef, useState } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase';
import { Image as ImageIcon } from 'lucide-react';
import { toStorageThumbnailUrl } from '@/lib/storageThumbnail';

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

async function headOk(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function resolveDownloadUrl(originalSrc: string): Promise<string | null> {
  try {
    const response = await fetch(originalSrc, { method: 'HEAD' });
    if (response.ok) return originalSrc;
  } catch {
    /* try SDK */
  }
  try {
    const storage = getStorage(firebaseApp);
    return await getDownloadURL(ref(storage, originalSrc));
  } catch (err) {
    console.error('Failed to refresh image URL', err);
    return null;
  }
}

/**
 * AuthenticatedImage — HEAD check + optional Storage refresh.
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
        const thumbUrl = toStorageThumbnailUrl(src);
        if (thumbUrl !== src && (await headOk(thumbUrl))) {
          if (!cancelled) {
            thumbShownRef.current = true;
            setDisplaySrc(thumbUrl);
            setLoading(false);
          }
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
