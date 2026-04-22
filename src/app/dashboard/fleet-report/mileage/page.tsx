'use client';

import React from 'react';
import { useFleetReport } from '../FleetReportContext';

export default function FleetReportMileagePage() {
  const { loading, mileageRows } = useFleetReport();

  return (
    <div className="space-y-4">
      <p className="text-zinc-600 dark:text-white/60 text-sm max-w-3xl">
        Each row is one inspection, grouped logically by vehicle in the export. <strong className="text-zinc-900 dark:text-white">Delta</strong> is vs the previous inspection on the same vehicle. Flags catch odometer rollbacks, very high implied daily mileage, or missing readings when a prior value exists.
      </p>
      {loading && mileageRows.length === 0 ? (
        <p className="text-zinc-600 dark:text-white/60 text-sm">Loading…</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/55">
                <th className="px-3 py-2 font-medium">Registration</th>
                <th className="px-3 py-2 font-medium">Inspected</th>
                <th className="px-3 py-2 font-medium">Mileage</th>
                <th className="px-3 py-2 font-medium">Δ</th>
                <th className="px-3 py-2 font-medium">Flag</th>
                <th className="px-3 py-2 font-medium">Detail</th>
                <th className="px-3 py-2 font-medium">Inspector</th>
              </tr>
            </thead>
            <tbody>
              {mileageRows.slice(0, 400).map((row) => {
                const flagged = row['Anomaly Flag'] === 'Yes' || row['Anomaly Flag'] === 'Review';
                return (
                  <tr
                    key={row['Inspection ID']}
                    className={`border-b border-zinc-100 dark:border-white/5 ${flagged ? 'bg-amber-50 dark:bg-amber-500/5' : ''}`}
                  >
                    <td className="px-3 py-2 text-zinc-900 dark:text-white font-medium">{row.Registration}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/80 whitespace-nowrap">{row['Inspected At']}</td>
                    <td className="px-3 py-2 text-zinc-900 dark:text-white tabular-nums">{row.Mileage}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-white/70 tabular-nums">{row['Delta Miles']}</td>
                    <td className="px-3 py-2">
                      {flagged ? (
                        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                          {row['Anomaly Flag']}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:border-white/15 dark:bg-white/5 dark:text-white/55">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-white/60 max-w-xs">{row['Anomaly Detail']}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/70">{row.Inspector}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {mileageRows.length > 400 && (
            <p className="text-zinc-500 dark:text-white/50 text-xs px-3 py-2 border-t border-zinc-200 dark:border-white/10">
              Showing first 400 rows — full history is in the Excel export.
            </p>
          )}
          {mileageRows.length === 0 && (
            <p className="text-zinc-600 dark:text-white/60 text-sm p-6">No inspections in the loaded period.</p>
          )}
        </div>
      )}
    </div>
  );
}
