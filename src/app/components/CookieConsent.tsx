'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  clearLegacyCookieConsent,
  isCookieBannerHiddenPath,
  readFtpConsent,
  updateAnalyticsConsent,
  writeFtpConsent,
  type AnalyticsConsentValue,
} from '@/lib/analytics';

const COOKIE_PAD_VAR = '--ftp-cookie-pad';

function clearCookiePad() {
  document.documentElement.style.removeProperty(COOKIE_PAD_VAR);
  delete document.documentElement.dataset.cookieBanner;
}

function setCookiePad(px: number) {
  document.documentElement.style.setProperty(COOKIE_PAD_VAR, `${Math.ceil(px)}px`);
  document.documentElement.dataset.cookieBanner = '1';
}

export default function CookieConsent() {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const bannerHidden = isCookieBannerHiddenPath(pathname);

  const hideBanner = useCallback(() => {
    setShowBanner(false);
    clearCookiePad();
  }, []);

  const openBanner = useCallback(() => {
    if (isCookieBannerHiddenPath(window.location.pathname)) return;
    setShowBanner(true);
  }, []);

  useEffect(() => {
    clearLegacyCookieConsent();
    if (bannerHidden) {
      hideBanner();
      return;
    }
    const existing = readFtpConsent();
    if (!existing) {
      setShowBanner(true);
    } else {
      hideBanner();
    }
  }, [bannerHidden, hideBanner]);

  useEffect(() => {
    const onOpen = () => openBanner();
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
  }, [openBanner]);

  useEffect(() => {
    return () => {
      clearCookiePad();
    };
  }, []);

  useEffect(() => {
    if (!showBanner) {
      clearCookiePad();
      return;
    }

    const el = bannerRef.current;
    if (!el) return;

    const sync = () => setCookiePad(el.getBoundingClientRect().height || 56);
    sync();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    ro?.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [showBanner]);

  const choose = (analytics: AnalyticsConsentValue) => {
    writeFtpConsent(analytics);
    // Reject: unload gtag if present. Accept: MarketingAnalytics mounts GoogleAnalytics,
    // which runs consent update then sends the current page_view once gtag.js loads.
    updateAnalyticsConsent(analytics);
    hideBanner();
  };

  if (bannerHidden || !showBanner) return null;

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--mkt-border)] bg-white shadow-[0_-8px_30px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom,0px)] min-[431px]:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-7xl mx-auto px-3 min-[431px]:px-4 py-1.5 min-[431px]:py-3 flex flex-row items-center gap-2 min-[431px]:gap-4">
        <p className="text-slate-600 text-[11px] min-[431px]:text-sm text-left leading-tight min-[431px]:leading-snug min-w-0 flex-1 min-[431px]:whitespace-normal min-[431px]:line-clamp-none">
          <span className="min-[431px]:hidden">
            Essential cookies run this site. Analytics optional.{' '}
            <Link
              href="/cookies/"
              className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
            >
              Cookie Policy
            </Link>
          </span>
          <span className="hidden min-[431px]:inline">
            We use essential cookies to run this site. With your permission we&apos;d also like to use Google
            Analytics cookies to see which pages help. No advertising cookies.{' '}
            <Link
              href="/cookies/"
              className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2 whitespace-nowrap"
            >
              Cookie Policy
            </Link>
          </span>
        </p>
        <div className="flex flex-row items-stretch gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose('granted')}
            className="px-3 min-[431px]:px-4 py-2 min-h-[44px] min-w-[5.5rem] min-[431px]:min-w-[7.5rem] text-sm font-medium text-white rounded-lg bg-[var(--brand-blue)] hover:bg-blue-600 transition-colors"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => choose('denied')}
            className="px-3 min-[431px]:px-4 py-2 min-h-[44px] min-w-[5.5rem] min-[431px]:min-w-[7.5rem] text-sm font-medium text-white rounded-lg bg-[var(--brand-blue)] hover:bg-blue-600 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
