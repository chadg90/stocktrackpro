'use client';

import { Suspense, useLayoutEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  referralCodeFromSearch,
  saveReferralIfFirst,
  stripReferralParamsFromLocation,
} from '@/lib/referralCode';

/**
 * Persists ?ref= / ?referral= from marketing pages (and onboarding) into ftp_ref.
 * First code wins; 90-day expiry handled in readStoredReferral.
 * On /onboarding/, strips ref/referral from the address bar before gtag runs.
 */
function ReferralCaptureInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    if (!pathname) return;
    // Skip signed-in product areas other than onboarding (onboarding needs capture too).
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) return;
    const code = referralCodeFromSearch(searchParams);
    if (!code) return;
    saveReferralIfFirst(code);
    const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    if (path === '/onboarding') {
      stripReferralParamsFromLocation();
    }
  }, [pathname, searchParams]);

  return null;
}

export default function ReferralCapture() {
  return (
    <Suspense fallback={null}>
      <ReferralCaptureInner />
    </Suspense>
  );
}
