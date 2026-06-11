'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useFleetReport } from '../FleetReportContext';
import {
  buildUserCompliance,
  buildVehicleWeekCompliance,
  compliancePeriodStatusLabels,
  filterInspectionsInWeek,
  formatCompliancePeriodRange,
  getCompliancePeriodBounds,
  type CompliancePeriodPreset,
} from '@/lib/fleetReportLogic';

const PERIOD_OPTIONS: { value: CompliancePeriodPreset; label: string }[] = [
  { value: 'week', label: 'This week' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'month', label: 'Choose month' },
];

export default function FleetReportCompliancePage() {
  const { loading, users, inspections, vehicles } = useFleetReport();
  const [period, setPeriod] = useState<CompliancePeriodPreset>('week');
  const [monthValue, setMonthValue] = useState(() => format(new Date(), 'yyyy-MM'));

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

  const periodRangeLabel = formatCompliancePeriodRange(periodBounds, period);
  const statusLabels = compliancePeriodStatusLabels(period);

  const periodDescription =
    period === 'week'
      ? 'this week'
      : period === 'last_30_days'
        ? 'the last 30 days'
        : format(periodBounds.start, 'MMMM yyyy');

  return (
    <div className="space-y-10 text-zinc-900 dark:text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-zinc-600 dark:text-white/65 text-sm max-w-3xl leading-relaxed">
          <strong className="text-zinc-900 dark:text-white">Users</strong> lists everyone with role{' '}
          <code className="rounded px-1 py-0.5 text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10">user</code> or{' '}
          <code className="rounded px-1 py-0.5 text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10">manager</code> and whether they submitted at least one vehicle inspection in {periodDescription}.{' '}
          <strong className="text-zinc-900 dark:text-white">Vehicles</strong> shows each non-archived vehicle and whether it was inspected in the same period.
        </p>

        <div className="flex flex-col gap-2 shrink-0">
          <span className="text-xs font-medium text-zinc-500 dark:text-white/50">Period</span>
          <div className="flex flex-wrap items-center gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === opt.value
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {period === 'month' && (
            <input
              type="month"
              value={monthValue}
              max={format(new Date(), 'yyyy-MM')}
              onChange={(e) => setMonthValue(e.target.value)}
              className="mt-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-white/15 dark:bg-white/5 dark:text-white"
              aria-label="Choose month"
            />
          )}
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
                    <td className="px-3 py-2 text-right text-zinc-900 dark:text-white tabular-nums">{u['Inspections This Week']}</td>
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
