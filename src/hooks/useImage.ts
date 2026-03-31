'use client';

import { useEffect, useState } from 'react';
import { getStorage } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase';
import { getImageUrlCached } from '@/lib/getImageUrl';

export function useImage(pathOrUrl: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(Boolean(pathOrUrl && firebaseApp));

  useEffect(() => {
    if (!pathOrUrl || !firebaseApp) {
      setUrl(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const storage = getStorage(firebaseApp);
    (async () => {
      try {
        const resolved = await getImageUrlCached(storage, pathOrUrl);
        if (!cancelled) {
          setUrl(resolved);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setUrl(null);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathOrUrl]);

  return { url, error, loading };
}
