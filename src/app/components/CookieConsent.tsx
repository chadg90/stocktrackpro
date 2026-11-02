'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  clearLegacyCookieConsent,
  isAnalyticsExcludedPath,
  readFtpConsent,
  updateAnalyticsConsent,
  writeFtpConsent,
  type AnalyticsConsentValue,
} from '@/lib/analytics';

export default function CookieConsent() {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);
  const excluded = isAnalyticsExcludedPath(pathname);

  const hideBanner = useCallback(() => {
    setShowBanner(false);
    delete document.documentElement.dataset.cookieBanner;
  }, []);

  const openBanner = useCallback(() => {
    if (isAnalyticsExcludedPath(window.location.pathname)) return;
    setShowBanner(true);
    document.documentElement.dataset.cookieBanner = '1';
  }, []);

  useEffect(() => {
    clearLegacyCookieConsent();
    if (excluded) {
      hideBanner();
      return;
    }
    const existing = readFtpConsent();
    if (!existing) {
      setShowBanner(true);
      document.documentElement.dataset.cookieBanner = '1';
    } else {
      hideBanner();
    }
  }, [excluded, hideBanner]);

  useEffect(() => {
    const onOpen = () => openBanner();
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
  }, [openBanner]);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.cookieBanner;
    };
  }, []);

  const choose = (analytics: AnalyticsConsentValue) => {
    writeFtpConsent(analytics);
    updateAnalyticsConsent(analytics);
    hideBanner();
  };

  if (excluded || !showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--mkt-border)] bg-white shadow-[0_-8px_30px_rgba(15,23,42,0.08)] pb-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[30vh] overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <p className="text-slate-600 text-xs sm:text-sm text-left leading-snug min-w-0 flex-1">
          We use essential cookies to run this site. With your permission we&apos;d also like to use Google
          Analytics cookies to see which pages help. No advertising cookies.{' '}
          <Link
            href="/cookies/"
            className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2 whitespace-nowrap"
          >
            Cookie Policy
          </Link>
        </p>
        <div className="flex flex-row items-stretch gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => choose('granted')}
            className="flex-1 sm:flex-none min-w-[8.5rem] px-4 py-2.5 min-h-[44px] text-sm font-medium text-white rounded-lg bg-[var(--brand-blue)] hover:bg-blue-600 transition-colors"
          >
            Accept analytics
          </button>
          <button
            type="button"
            onClick={() => choose('denied')}
            className="flex-1 sm:flex-none min-w-[8.5rem] px-4 py-2.5 min-h-[44px] text-sm font-medium text-white rounded-lg bg-[var(--brand-blue)] hover:bg-blue-600 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
