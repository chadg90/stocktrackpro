'use client';

import DashboardPageTitle from '../components/DashboardPageTitle';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FleetReportProvider } from './FleetReportContext';
import FleetReportSubnav from './FleetReportSubnav';
import PageGuideButton from '../components/PageGuide';

export default function FleetReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <FleetReportProvider>
      <DashboardPageTitle title="Fleet report" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <Link
            href="/dashboard/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Fleet report
            </h1>
            <PageGuideButton pageId="fleet-report" />
          </div>
          <p className="text-zinc-500 dark:text-white/55 text-sm mt-1">
            Overview and who checked. Excel export is on Overview. Mileage and Inspections are in the sidebar.
          </p>
        </div>
        <FleetReportSubnav />
        {children}
      </div>
    </FleetReportProvider>
  );
}
