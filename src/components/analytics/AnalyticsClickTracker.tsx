'use client';

import { useEffect } from 'react';
import { track, type WhatsAppTrackIntent, type WhatsAppTrackLocation } from '@/lib/analytics';

const WHATSAPP_LOCATIONS = new Set<WhatsAppTrackLocation>([
  'hero',
  'header',
  'contact',
  'footer',
  'pricing',
  'floating',
]);

function isWhatsAppHref(href: string): boolean {
  return /wa\.me\//i.test(href) || /api\.whatsapp\.com\//i.test(href) || /whatsapp\.com\/send/i.test(href);
}

function isAppStoreHref(href: string): boolean {
  return /apps\.apple\.com\//i.test(href);
}

/**
 * Captures marketing clicks on WhatsApp + App Store links via data-analytics-* attributes.
 * No-ops on /dashboard/** inside track().
 */
export default function AnalyticsClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (!anchor || !anchor.href) return;

      const href = anchor.href;

      if (isWhatsAppHref(href)) {
        const locationRaw = anchor.dataset.analyticsLocation || '';
        const intentRaw = anchor.dataset.analyticsIntent || 'support';
        const location = WHATSAPP_LOCATIONS.has(locationRaw as WhatsAppTrackLocation)
          ? (locationRaw as WhatsAppTrackLocation)
          : null;
        const intent: WhatsAppTrackIntent = intentRaw === 'demo' ? 'demo' : 'support';
        if (location) {
          track('click_whatsapp', { location, intent });
        }
        return;
      }

      if (isAppStoreHref(href)) {
        const location = anchor.dataset.analyticsLocation || 'unknown';
        track('click_app_store', { location });
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
