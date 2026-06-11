'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { useFleetReport } from '../FleetReportContext';
import FleetReportPeriodControls from '../FleetReportPeriodControls';
import {
  buildStaffVehicleCheckRows,
  buildUserCompliance,
  buildUserVehicleGapRows,
  buildVehicleWeekCompliance,
  compliancePeriodStatusLabels,
  filterInspectionsInWeek,
  formatCompliancePeriodRange,
  getCompliancePeriodBounds,
  type CompliancePeriodPreset,
} from '@/lib/fleetReportLogic';
import { exportMultipleSheetsToExcel } from '@/lib/exportUtils';

type GapFilter = 'all' | 'inactive_users' | 'unchecked_vehicles';

export default function FleetReportCompliancePage() {
  const { loading, users, inspections, vehicles } = useFleetReport();
  const [period, setPeriod] = useState<CompliancePeriodPreset>('week');
  const [monthValue, setMonthValue] = useState(() => format(new Date(), 'yyyy-MM'));
  const [gapFilter, setGapFilter] = useState<GapFilter>('all');
  const [exporting, setExporting] = useState(false);

  const periodBounds = useMemo(
    () => getCompliancePeriodBounds(period, monthValue),
    [period, monthValue]
  );

  const periodInspections = useMemo(
    () => filterInspectionsInWeek(inspections, periodBounds.start, periodBounds.end),
    [inspections, periodBounds.start, periodBounds.end]
  );

  const userCompliance = useMemo(
    () => buildUserCompliance(users, periodInspections),
    [users, periodInspections]
  );

  const vehicleRows = useMemo(
    () => buildVehicleWeekCompliance(vehicles, periodInspections, users),
    [vehicles, periodInspections, users]
  );

  const staffVehicleChecks = useMemo(
    () => buildStaffVehicleCheckRows(users, vehicles, periodInspections),
    [users, vehicles, periodInspections]
  );

  const gapRows = useMemo(() => {
    const all = buildUserVehicleGapRows(users, vehicles, periodInspections);
    if (gapFilter === 'inactive_users') {
      return all.filter((r) => r['User did any check'] === 'No');
    }
    if (gapFilter === 'unchecked_vehicles') {
      return all.filter((r) => r['Vehicle inspected by anyone'] === 'No');
    }
    return all;
  }, [users, vehicles, periodInspections, gapFilter]);

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
            name: 'Users',
            data: userCompliance.map((u) => ({
              User: u.User,
              Email: u.Email,
              Role: u.Role,
              Inspections: u['Inspections This Week'],
              Status:
                u['Inspections This Week'] > 0 ? statusLabels.checked : statusLabels.notChecked,
            })),
          },
          {
            name: 'Vehicles',
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
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-10 text-zinc-900 dark:text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <p className="text-zinc-600 dark:text-white/65 text-sm max-w-3xl leading-relaxed">
          See which staff submitted vehicle inspections in {periodDescription}, which vehicles were checked,
          and where gaps remain. <strong className="text-zinc-900 dark:text-white">Export Excel</strong> downloads
          the same Users and Vehicles tables shown below ({periodRangeLabel}).
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

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Users — who checked</h2>
        <p className="text-zinc-500 dark:text-white/50 text-xs mb-4">Period: {periodRangeLabel}</p>
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/50">
                <th className="px-3 py-2 text-left font-medium">User</th>
                <th className="px-3 py-2 text-left font-medium">Email</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-right font-medium">Inspections</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && userCompliance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    Loading…
                  </td>
                </tr>
              ) : userCompliance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    No user/manager profiles found for this company.
                  </td>
                </tr>
              ) : (
                userCompliance.map((u) => (
                  <tr key={u['User ID']} className="border-b border-zinc-100 dark:border-white/5">
                    <td className="px-3 py-2 text-zinc-900 dark:text-white font-medium">{u.User}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-white/60">{u.Email}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/70 capitalize">{u.Role}</td>
                    <td className="px-3 py-2 text-right text-zinc-900 dark:text-white tabular-nums">
                      {u['Inspections This Week']}
                    </td>
                    <td className="px-3 py-2">
                      {u['Inspections This Week'] > 0 ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-green-300">
                          {statusLabels.checked}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                          {statusLabels.notChecked}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Checks by staff &amp; vehicle</h2>
        <p className="text-zinc-500 dark:text-white/50 text-xs mb-4">
          Each row is a staff member who inspected a specific vehicle in this period.
        </p>
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/50">
                <th className="px-3 py-2 text-left font-medium">User</th>
                <th className="px-3 py-2 text-left font-medium">Email</th>
                <th className="px-3 py-2 text-left font-medium">Vehicle</th>
                <th className="px-3 py-2 text-left font-medium">Make / model</th>
                <th className="px-3 py-2 text-right font-medium">Checks</th>
                <th className="px-3 py-2 text-left font-medium">Last checked</th>
              </tr>
            </thead>
            <tbody>
              {loading && staffVehicleChecks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    Loading…
                  </td>
                </tr>
              ) : staffVehicleChecks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-zinc-500 dark:text-white/50">
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
                    <td className="px-3 py-2 text-zinc-600 dark:text-white/60">{row.Email}</td>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Missing checks — staff vs vehicles</h2>
            <p className="text-zinc-500 dark:text-white/50 text-xs">
              Staff who did not inspect each vehicle in this period. Filter to focus on inactive users or
              vehicles nobody checked.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: 'all', label: 'All gaps' },
                { value: 'inactive_users', label: 'Inactive users only' },
                { value: 'unchecked_vehicles', label: 'Unchecked vehicles' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGapFilter(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  gapFilter === opt.value
                    ? 'bg-amber-500 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/50">
                <th className="px-3 py-2 text-left font-medium">User</th>
                <th className="px-3 py-2 text-left font-medium">Email</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-left font-medium">Vehicle</th>
                <th className="px-3 py-2 text-left font-medium">Make / model</th>
                <th className="px-3 py-2 text-left font-medium">User active?</th>
                <th className="px-3 py-2 text-left font-medium">Vehicle checked?</th>
              </tr>
            </thead>
            <tbody>
              {loading && gapRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    Loading…
                  </td>
                </tr>
              ) : gapRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    No gaps for this filter — every staff member checked every vehicle in this period.
                  </td>
                </tr>
              ) : (
                gapRows.map((row, idx) => (
                  <tr
                    key={`${row.User}-${row.Registration}-${idx}`}
                    className="border-b border-zinc-100 dark:border-white/5"
                  >
                    <td className="px-3 py-2 text-zinc-900 dark:text-white font-medium">{row.User}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-white/60">{row.Email}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/70 capitalize">{row.Role}</td>
                    <td className="px-3 py-2 text-zinc-900 dark:text-white font-medium">{row.Registration}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/70">{row['Make / Model']}</td>
                    <td className="px-3 py-2">
                      {row['User did any check'] === 'Yes' ? (
                        <span className="text-emerald-700 dark:text-green-300 text-xs font-medium">Yes</span>
                      ) : (
                        <span className="text-amber-800 dark:text-amber-200 text-xs font-semibold">No checks</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row['Vehicle inspected by anyone'] === 'Yes' ? (
                        <span className="text-zinc-600 dark:text-white/60 text-xs">By someone else</span>
                      ) : (
                        <span className="text-amber-800 dark:text-amber-200 text-xs font-semibold">Not checked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Vehicles — inspected in period?</h2>
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
