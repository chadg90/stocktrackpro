'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { useFleetReport } from '../FleetReportContext';
import FleetReportPeriodControls from '../FleetReportPeriodControls';
import {
  buildStaffVehicleCheckRows,
  buildVehicleWeekCompliance,
  compliancePeriodStatusLabels,
  filterInspectionsInWeek,
  formatCompliancePeriodRange,
  getCompliancePeriodBounds,
  type CompliancePeriodPreset,
} from '@/lib/fleetReportLogic';
import { exportMultipleSheetsToExcel } from '@/lib/exportUtils';
import { trackFeatureClick } from '@/lib/productUsage';

export default function FleetReportCompliancePage() {
  const { loading, historyLoading, users, inspections, vehicles } = useFleetReport();
  const [period, setPeriod] = useState<CompliancePeriodPreset>('week');
  const [monthValue, setMonthValue] = useState(() => format(new Date(), 'yyyy-MM'));
  const [exporting, setExporting] = useState(false);

  const periodBounds = useMemo(
    () => getCompliancePeriodBounds(period, monthValue),
    [period, monthValue]
  );

  const periodInspections = useMemo(
    () => filterInspectionsInWeek(inspections, periodBounds.start, periodBounds.end),
    [inspections, periodBounds.start, periodBounds.end]
  );

  const vehicleRows = useMemo(
    () => buildVehicleWeekCompliance(vehicles, periodInspections, users),
    [vehicles, periodInspections, users]
  );

  const staffVehicleChecks = useMemo(
    () => buildStaffVehicleCheckRows(users, vehicles, periodInspections),
    [users, vehicles, periodInspections]
  );

  const periodRangeLabel = formatCompliancePeriodRange(periodBounds, period);
  const statusLabels = compliancePeriodStatusLabels(period);

  const periodDescription =
    period === 'week'
      ? 'this week'
      : period === 'last_30_days'
        ? 'the last 30 days'
        : format(periodBounds.start, 'MMMM yyyy');

  const handleExport = () => {
    setExporting(true);
    try {
      const slug =
        period === 'month'
          ? monthValue
          : period === 'last_30_days'
            ? 'last-30-days'
            : format(periodBounds.start, 'yyyy-MM-dd');
      exportMultipleSheetsToExcel(
        [
          {
            name: 'Checks by staff & vehicle',
            data: staffVehicleChecks.map((row) => ({
              User: row.User,
              Vehicle: row.Registration,
              'Make / model': row['Make / Model'],
              Checks: row['Check count'],
              'Last checked': row['Last checked'],
            })),
          },
          {
            name: 'Vehicles inspected',
            data: vehicleRows.map((v) => ({
              Registration: v.Registration,
              'Make / model': v['Make / Model'],
              Inspected:
                v['Inspected This Week'] === 'Yes' ? statusLabels.inspected : statusLabels.notInspected,
              'Last inspection': v['Last Inspection'],
              Inspector: v['Inspector (last in week)'],
            })),
          },
        ],
        `stp-who-checked-${slug}`
      );
      void trackFeatureClick('fleet_report_export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-10 text-zinc-900 dark:text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <p className="text-zinc-600 dark:text-white/65 text-sm max-w-3xl leading-relaxed">
          See which staff inspected which vehicles in {periodDescription}, and whether each vehicle was checked.
          <strong className="text-zinc-900 dark:text-white"> Export Excel</strong> downloads the tables below (
          {periodRangeLabel}).
        </p>

        <div className="flex flex-col gap-3 shrink-0 items-stretch sm:items-end">
          <FleetReportPeriodControls
            period={period}
            monthValue={monthValue}
            onPeriodChange={setPeriod}
            onMonthChange={setMonthValue}
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            {exporting ? 'Exporting…' : 'Export Excel'}
          </button>
        </div>
      </div>

      {historyLoading && period === 'month' && (
        <p className="text-xs text-zinc-500 dark:text-white/50">Loading older history for month view…</p>
      )}

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Checks by staff &amp; vehicle</h2>
        <p className="text-zinc-500 dark:text-white/50 text-xs mb-4">
          Each row is a staff member who inspected a specific vehicle in this period.
        </p>
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/50">
                <th className="px-3 py-2 text-left font-medium">User</th>
                <th className="px-3 py-2 text-left font-medium">Vehicle</th>
                <th className="px-3 py-2 text-left font-medium">Make / model</th>
                <th className="px-3 py-2 text-right font-medium">Checks</th>
                <th className="px-3 py-2 text-left font-medium">Last checked</th>
              </tr>
            </thead>
            <tbody>
              {loading && staffVehicleChecks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    Loading…
                  </td>
                </tr>
              ) : staffVehicleChecks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    No staff vehicle checks in this period.
                  </td>
                </tr>
              ) : (
                staffVehicleChecks.map((row, idx) => (
                  <tr
                    key={`${row.User}-${row.Registration}-${idx}`}
                    className="border-b border-zinc-100 dark:border-white/5"
                  >
                    <td className="px-3 py-2 text-zinc-900 dark:text-white font-medium">{row.User}</td>
                    <td className="px-3 py-2 text-zinc-900 dark:text-white font-medium">{row.Registration}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/70">{row['Make / Model']}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-zinc-900 dark:text-white">
                      {row['Check count']}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-white/60 whitespace-nowrap">
                      {row['Last checked']}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Vehicles inspected?</h2>
        <p className="text-zinc-500 dark:text-white/50 text-xs mb-4">Period: {periodRangeLabel}</p>
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/50">
                <th className="px-3 py-2 text-left font-medium">Registration</th>
                <th className="px-3 py-2 text-left font-medium">Make / model</th>
                <th className="px-3 py-2 text-left font-medium">Inspected</th>
                <th className="px-3 py-2 text-left font-medium">Last inspection</th>
                <th className="px-3 py-2 text-left font-medium">Inspector</th>
              </tr>
            </thead>
            <tbody>
              {loading && vehicleRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    Loading…
                  </td>
                </tr>
              ) : vehicleRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    No vehicles on file.
                  </td>
                </tr>
              ) : (
                vehicleRows.map((v) => (
                  <tr key={v['Vehicle ID']} className="border-b border-zinc-100 dark:border-white/5">
                    <td className="px-3 py-2 text-zinc-900 dark:text-white font-medium">{v.Registration}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/70">{v['Make / Model']}</td>
                    <td className="px-3 py-2">
                      {v['Inspected This Week'] === 'Yes' ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-green-300">
                          {statusLabels.inspected}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                          {statusLabels.notInspected}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-white/60 whitespace-nowrap">{v['Last Inspection']}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/70">{v['Inspector (last in week)']}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
