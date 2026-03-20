'use client';

import React from 'react';
import { useFleetReport } from '../FleetReportContext';
import { formatFleetDate, getUserLabel } from '@/lib/fleetReportLogic';

export default function FleetReportDefectsPage() {
  const { loading, defects, outstandingDefects, vehicles, users } = useFleetReport();
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const row = (d: (typeof defects)[0], key: string) => (
    <tr key={key} className="border-b border-white/5">
      <td className="px-3 py-2 text-white">{vehicleMap[d.vehicle_id || '']?.registration || d.vehicle_id || '—'}</td>
      <td className="px-3 py-2 text-white/80 max-w-xs truncate" title={d.description}>
        {d.description || '—'}
      </td>
      <td className="px-3 py-2 text-white/70 capitalize">{d.severity || '—'}</td>
      <td className="px-3 py-2">
        <span
          className={
            d.status === 'resolved' ? 'text-green-400' : d.status === 'investigating' ? 'text-amber-300' : 'text-red-300'
          }
        >
          {d.status || '—'}
        </span>
      </td>
      <td className="px-3 py-2 text-white/60 whitespace-nowrap">{formatFleetDate(d.reported_at)}</td>
      <td className="px-3 py-2 text-white/70">{getUserLabel(userMap[d.reported_by || ''], d.reported_by || '')}</td>
    </tr>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Outstanding</h2>
        <p className="text-white/55 text-sm mb-4">Defects not marked resolved (pending or investigating).</p>
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="px-3 py-2 text-left font-medium">Vehicle</th>
                <th className="px-3 py-2 text-left font-medium">Description</th>
                <th className="px-3 py-2 text-left font-medium">Severity</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Reported</th>
                <th className="px-3 py-2 text-left font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {loading && outstandingDefects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-white/50">
                    Loading…
                  </td>
                </tr>
              ) : outstandingDefects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-white/50">
                    No outstanding defects in the loaded period.
                  </td>
                </tr>
              ) : (
                outstandingDefects.map((d) => row(d, `out-${d.id}`))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">All defects (loaded period)</h2>
        <p className="text-white/55 text-sm mb-4">Includes resolved items from the last 365 days.</p>
        <div className="dashboard-card overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="sticky top-0 bg-zinc-900/95 border-b border-white/10">
              <tr className="text-white/50">
                <th className="px-3 py-2 text-left font-medium">Vehicle</th>
                <th className="px-3 py-2 text-left font-medium">Description</th>
                <th className="px-3 py-2 text-left font-medium">Severity</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Reported</th>
                <th className="px-3 py-2 text-left font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {defects.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-white/50">
                    No defects in range.
                  </td>
                </tr>
              ) : (
                defects.slice(0, 500).map((d) => row(d, d.id))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
