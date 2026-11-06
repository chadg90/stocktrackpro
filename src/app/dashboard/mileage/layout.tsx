'use client';

import React from 'react';
import { FleetReportProvider } from '../fleet-report/FleetReportContext';
import PageGuideButton from '../components/PageGuide';
import DashboardPageTitle from '../components/DashboardPageTitle';

export default function MileageLayout({ children }: { children: React.ReactNode }) {
  return (
    <FleetReportProvider>
      <DashboardPageTitle title="Mileage" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Mileage</h1>
            <PageGuideButton pageId="fleet-report" />
          </div>
          <p className="text-zinc-500 dark:text-white/55 text-sm mt-1">
            Review flagged odometer readings and browse mileage history across the fleet.
          </p>
        </div>
        {children}
      </div>
    </FleetReportProvider>
  );
}
