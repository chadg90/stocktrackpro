'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FleetReportProvider } from './FleetReportContext';
import FleetReportSubnav from './FleetReportSubnav';

export default function FleetReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <FleetReportProvider>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
        <div className="mb-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">Fleet report</h1>
          <p className="text-zinc-600 dark:text-white/60 text-sm mt-1 max-w-2xl">
            Mileage trends, defects, this week&apos;s inspections, and team compliance. Export everything to Excel
            from the overview.
          </p>
        </div>
        <FleetReportSubnav />
        {children}
      </div>
    </FleetReportProvider>
  );
}
