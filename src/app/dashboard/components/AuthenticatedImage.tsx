import React, { useEffect, useState } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase';
import { Image as ImageIcon } from 'lucide-react';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
};

/**
 * AuthenticatedImage
 * Tries the provided URL; if it fails (expired token), it refreshes via Firebase Storage SDK using current auth.
 */
export default function AuthenticatedImage({ src, alt, className }: Props) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!src) {
        setLoading(false);
        setError(true);
        return;
      }

      // 1) Try direct load first (handles valid download URLs with token)
      try {
        const response = await fetch(src, { method: 'HEAD' });
        if (response.ok) {
          if (isMounted) {
            setCurrentSrc(src);
            setLoading(false);
            return;
          }
        }
      } catch {
        // proceed to refresh
      }

      // 2) Try refreshing via Storage SDK (requires valid firebaseApp and auth session)
      try {
        const storage = getStorage(firebaseApp);
        // ref can accept both gs:// and https download URLs
        const storageRef = ref(storage, src);
        const freshUrl = await getDownloadURL(storageRef);
        if (isMounted) {
          setCurrentSrc(freshUrl);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to refresh image URL', err);
      }

      if (isMounted) {
        setError(true);
        setLoading(false);
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (loading) {
    return <div className={`animate-pulse bg-white/10 ${className ?? ''}`} />;
  }

  if (error || !currentSrc) {
    return (
      <div className={`flex items-center justify-center bg-white/5 text-white/30 ${className ?? ''}`}>
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={currentSrc} alt={alt} className={className} />;
}
