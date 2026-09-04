'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';

/**
 * Vercel Web Analytics for marketing traffic only (Hobby — no extra cost).
 * Dashboard / auth / invite / checkout-return traffic is excluded so admin and
 * customer product usage does not inflate website visitor stats.
 */
const EXCLUDED_PATH_PREFIXES = [
  '/dashboard',
  '/onboarding',
  '/invite',
  '/return',
  '/api',
] as const;

function pathFromEventUrl(url: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new URL(url).pathname;
    }
  } catch {
    // Fall through to relative handling
  }
  const path = url.split('?')[0].split('#')[0];
  return path.startsWith('/') ? path : `/${path}`;
}

function isExcludedMarketingPath(pathname: string): boolean {
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return EXCLUDED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (isExcludedMarketingPath(pathFromEventUrl(event.url))) {
    return null;
  }
  return event;
}

export default function MarketingAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
