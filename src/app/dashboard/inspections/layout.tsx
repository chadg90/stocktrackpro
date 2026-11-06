'use client';

import React from 'react';
import { FleetReportProvider } from '../fleet-report/FleetReportContext';
import DashboardPageTitle from '../components/DashboardPageTitle';

export default function InspectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <FleetReportProvider>
      <DashboardPageTitle title="Inspections" />
      {children}
    </FleetReportProvider>
  );
}
