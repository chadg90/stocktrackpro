'use client';

import { useEffect } from 'react';

/** Sets `Title | Fleet Track PRO` for the browser tab while the page is mounted. */
export default function DashboardPageTitle({ title }: { title: string }) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | Fleet Track PRO`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return null;
}
