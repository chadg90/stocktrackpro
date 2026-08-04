'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackDashboardPageView } from '@/lib/productUsage';

/** Records authorized dashboard navigations for admin product-usage analytics. */
export default function DashboardUsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    void trackDashboardPageView(pathname);
  }, [pathname]);

  return null;
}
