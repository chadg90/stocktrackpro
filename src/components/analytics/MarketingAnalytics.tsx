'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import GaPageViews from '@/components/analytics/GaPageViews';
import AnalyticsClickTracker from '@/components/analytics/AnalyticsClickTracker';
import {
  FTP_CONSENT_CHANGED_EVENT,
  getGaId,
  hasAnalyticsConsent,
  isGtagBlockedPath,
} from '@/lib/analytics';

/**
 * Loads gtag only after Accept (or when ftp_consent is already granted).
 * Reject / no choice → zero requests to googletagmanager.com / google-analytics.com.
 */
export default function MarketingAnalytics() {
  const pathname = usePathname();
  const gaId = getGaId();
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    const sync = () => setConsentGranted(hasAnalyticsConsent());
    sync();
    window.addEventListener(FTP_CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(FTP_CONSENT_CHANGED_EVENT, sync);
  }, []);

  if (!gaId || isGtagBlockedPath(pathname) || !consentGranted) return null;

  return (
    <>
      <GoogleAnalytics measurementId={gaId} />
      <AnalyticsClickTracker />
      <GaPageViews />
    </>
  );
}
