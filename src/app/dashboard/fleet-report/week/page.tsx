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
      <p className="text-white/55 text-sm">
        Current week (Monday–Sunday):{' '}
        <strong className="text-white">
          {format(weekBounds.start, 'EEEE d MMM')} → {format(weekBounds.end, 'EEEE d MMM yyyy')}
        </strong>
        . Same window is used in the Excel &quot;Week inspections&quot; sheet.
      </p>
      <div className="dashboard-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
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
                <td colSpan={5} className="px-3 py-6 text-white/50">
                  Loading…
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-white/50">
                  No inspections recorded this week yet.
                </td>
              </tr>
            ) : (
              sorted.map((i) => (
                <tr key={i.id} className="border-b border-white/5">
                  <td className="px-3 py-2 text-white/80 whitespace-nowrap">{formatFleetDate(i.inspected_at)}</td>
                  <td className="px-3 py-2 text-white">
                    {vehicleMap[i.vehicle_id || '']?.registration || i.vehicle_id || '—'}
                  </td>
                  <td className="px-3 py-2 text-white/70 tabular-nums">{i.mileage ?? '—'}</td>
                  <td className="px-3 py-2">{i.has_defect ? <span className="text-amber-300">Yes</span> : <span className="text-white/40">No</span>}</td>
                  <td className="px-3 py-2 text-white/70">
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
