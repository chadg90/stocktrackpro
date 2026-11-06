import type { ReactNode } from 'react';
import Link from 'next/link';

/** In-text product link — wrap an existing phrase; do not change the words. */
export default function DefectReportingLink({ children }: { children: ReactNode }) {
  return (
    <Link
      href="/vehicle-defect-reporting-software/"
      className="text-[var(--brand-blue)] font-medium underline underline-offset-4 hover:text-[var(--brand-blue-hover)]"
    >
      {children}
    </Link>
  );
}
