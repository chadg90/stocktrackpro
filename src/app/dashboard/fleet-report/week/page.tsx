'use client';

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { useFleetReport } from '../FleetReportContext';
import { formatFleetDate, getUserLabel, toJsDate } from '@/lib/fleetReportLogic';

export default function FleetReportWeekPage() {
  const { loading, weekInspections, vehicles, users, weekBounds } = useFleetReport();
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const sorted = useMemo(
    () =>
      weekInspections.slice().sort((a, b) => {
        const tb = toJsDate(b.inspected_at)?.getTime() ?? 0;
        const ta = toJsDate(a.inspected_at)?.getTime() ?? 0;
        return tb - ta;
      }),
    [weekInspections]
  );

  return (
    <div className="space-y-4">
      <p className="text-zinc-600 dark:text-white/60 text-sm">
        Current week (Monday–Sunday):{' '}
        <strong className="text-zinc-900 dark:text-white">
          {format(weekBounds.start, 'EEEE d MMM')} → {format(weekBounds.end, 'EEEE d MMM yyyy')}
        </strong>
        . Same window is used in the Excel &quot;Week inspections&quot; sheet.
      </p>
      <div className="dashboard-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/55">
              <th className="px-3 py-2 text-left font-medium">When</th>
              <th className="px-3 py-2 text-left font-medium">Vehicle</th>
              <th className="px-3 py-2 text-left font-medium">Mileage</th>
              <th className="px-3 py-2 text-left font-medium">Defect?</th>
              <th className="px-3 py-2 text-left font-medium">Inspector</th>
            </tr>
          </thead>
          <tbody>
            {loading && sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-zinc-600 dark:text-white/60">
                  Loading…
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-zinc-600 dark:text-white/60">
                  No inspections recorded this week yet.
                </td>
              </tr>
            ) : (
              sorted.map((i) => (
                <tr key={i.id} className="border-b border-zinc-100 dark:border-white/5">
                  <td className="px-3 py-2 text-zinc-700 dark:text-white/80 whitespace-nowrap">{formatFleetDate(i.inspected_at)}</td>
                  <td className="px-3 py-2 text-zinc-900 dark:text-white font-medium">
                    {vehicleMap[i.vehicle_id || '']?.registration || i.vehicle_id || '—'}
                  </td>
                  <td className="px-3 py-2 text-zinc-700 dark:text-white/70 tabular-nums">{i.mileage ?? '—'}</td>
                  <td className="px-3 py-2">
                    {i.has_defect ? (
                      <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:border-white/15 dark:bg-white/5 dark:text-white/55">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-zinc-700 dark:text-white/70">
                    {getUserLabel(userMap[i.inspected_by || ''], i.inspected_by || '')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
