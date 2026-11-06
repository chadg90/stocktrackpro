'use client';

import { useEffect } from 'react';
import { ensureFirebase } from '@/lib/firebase';

/**
 * Loads and initialises the Firebase client SDK for authenticated product routes only.
 * Mount from /dashboard, /onboarding, and /invite layouts — never from the root marketing layout.
 */
export default function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  // Importing this module already inits in the browser; effect keeps the dependency explicit.
  useEffect(() => {
    ensureFirebase();
  }, []);
  return <>{children}</>;
}
