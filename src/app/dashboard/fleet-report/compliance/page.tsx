'use client';

import React from 'react';
import { format } from 'date-fns';
import { useFleetReport } from '../FleetReportContext';

export default function FleetReportCompliancePage() {
  const { loading, userCompliance, vehicleWeekRows, weekBounds } = useFleetReport();

  return (
    <div className="space-y-10 text-zinc-900 dark:text-white">
      <p className="text-zinc-600 dark:text-white/65 text-sm max-w-3xl leading-relaxed">
        <strong className="text-zinc-900 dark:text-white">Users</strong> lists everyone with role{' '}
        <code className="rounded px-1 py-0.5 text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10">user</code> or{' '}
        <code className="rounded px-1 py-0.5 text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10">manager</code> and whether they submitted at least one vehicle inspection this week.{' '}
        <strong className="text-zinc-900 dark:text-white">Vehicles</strong> shows each non-archived vehicle and whether it was inspected in the same week.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Users — who checked this week</h2>
        <p className="text-zinc-500 dark:text-white/50 text-xs mb-4">
          Week: {format(weekBounds.start, 'd MMM')} – {format(weekBounds.end, 'd MMM yyyy')}
        </p>
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
                          Checked
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                          No inspection this week
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
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Vehicles — inspected this week?</h2>
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/50">
                <th className="px-3 py-2 text-left font-medium">Registration</th>
                <th className="px-3 py-2 text-left font-medium">Make / model</th>
                <th className="px-3 py-2 text-left font-medium">This week</th>
                <th className="px-3 py-2 text-left font-medium">Last inspection (week)</th>
                <th className="px-3 py-2 text-left font-medium">Inspector</th>
              </tr>
            </thead>
            <tbody>
              {loading && vehicleWeekRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    Loading…
                  </td>
                </tr>
              ) : vehicleWeekRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-zinc-500 dark:text-white/50">
                    No vehicles on file.
                  </td>
                </tr>
              ) : (
                vehicleWeekRows.map((v) => (
                  <tr key={v['Vehicle ID']} className="border-b border-zinc-100 dark:border-white/5">
                    <td className="px-3 py-2 text-zinc-900 dark:text-white font-medium">{v.Registration}</td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/70">{v['Make / Model']}</td>
                    <td className="px-3 py-2">
                      {v['Inspected This Week'] === 'Yes' ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-green-300">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                          No
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
