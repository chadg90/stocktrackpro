'use client';

import { useEffect } from 'react';
import {
  FTP_ANALYTICS_READY_EVENT,
  flushQueuedBeginSignup,
  sendCurrentPageView,
  sendOnboardingPageViewIfAllowed,
} from '@/lib/analytics';

type GoogleAnalyticsProps = {
  measurementId: string;
};

export const GTAG_SCRIPT_ID = 'ftp-gtag-js';

/**
 * Basic consent: mount ONLY after Accept (or when ftp_consent is already granted).
 * After gtag loads: consent update → one page_view for the current page.
 */
export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;

    try {
      if (window.location.search.includes('internal=1')) {
        localStorage.setItem('ftp_internal', '1');
      }
    } catch {
      // ignore storage errors (private mode / blocked storage)
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // GA expects the Arguments object, not a rest array.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };

    // Scripts only load after Accept — default analytics_storage to granted.
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });
    window.gtag('js', new Date());
    let isInternal = false;
    try {
      isInternal = localStorage.getItem('ftp_internal') === '1';
    } catch {
      // ignore storage errors
    }
    window.gtag('config', measurementId, {
      send_page_view: false,
      anonymize_ip: true,
      ...(isInternal ? { traffic_type: 'internal' } : {}),
    });

    const onReady = () => {
      // Explicit grant (matches Accept → consent update → page_view).
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
      sendCurrentPageView();
      sendOnboardingPageViewIfAllowed();
      flushQueuedBeginSignup();
      window.dispatchEvent(new Event(FTP_ANALYTICS_READY_EVENT));
    };

    const markLoadedAndReady = () => {
      script!.dataset.loaded = '1';
      onReady();
    };

    let script = document.getElementById(GTAG_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = GTAG_SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.addEventListener('load', markLoadedAndReady);
      document.head.appendChild(script);
    } else if (script.dataset.loaded === '1') {
      onReady();
    } else {
      script.addEventListener('load', markLoadedAndReady);
    }

    return () => {
      script?.removeEventListener('load', markLoadedAndReady);
    };
  }, [measurementId]);

  return null;
}
