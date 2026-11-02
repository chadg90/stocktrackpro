'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { isAnalyticsExcludedPath, stripPiiFromUrl } from '@/lib/analytics';

/** Module-level guard so React Strict Mode remounts do not double-fire. */
let lastPageViewKey: string | null = null;

function GaPageViewsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || isAnalyticsExcludedPath(pathname)) return;
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    const qs = searchParams?.toString() ?? '';
    const key = `${pathname}${qs ? `?${qs}` : ''}`;
    if (lastPageViewKey === key) return;
    lastPageViewKey = key;

    const page_location = stripPiiFromUrl(window.location.href);
    const page_path = `${pathname}${qs ? `?${qs}` : ''}`;

    window.gtag('event', 'page_view', {
      page_location,
      page_path,
      page_title: document.title,
    });
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
