'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  FTP_ANALYTICS_READY_EVENT,
  hasAnalyticsConsent,
  isAnalyticsExcludedPath,
  sendCurrentPageView,
} from '@/lib/analytics';

/**
 * Route-change page_views after gtag is ready.
 * The Accept / first-load hit is sent from GoogleAnalytics (consent update → page_view).
 */
function GaPageViewsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gtagReadyRef = useRef(false);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const onReady = () => {
      gtagReadyRef.current = true;
      // Record current route so we do not re-send the Accept landing page_view.
      if (pathname) {
        const qs = searchParams?.toString() ?? '';
        lastKeyRef.current = `${pathname}${qs ? `?${qs}` : ''}`;
      }
    };
    window.addEventListener(FTP_ANALYTICS_READY_EVENT, onReady);
    return () => window.removeEventListener(FTP_ANALYTICS_READY_EVENT, onReady);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!pathname || isAnalyticsExcludedPath(pathname)) return;
    if (!hasAnalyticsConsent()) return;
    if (!gtagReadyRef.current) return;
    if (typeof window.gtag !== 'function') return;

    const qs = searchParams?.toString() ?? '';
    const key = `${pathname}${qs ? `?${qs}` : ''}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    sendCurrentPageView();
  }, [pathname, searchParams]);

  return null;
}

export default function GaPageViews() {
  return (
    <Suspense fallback={null}>
      <GaPageViewsInner />
    </Suspense>
  );
}
