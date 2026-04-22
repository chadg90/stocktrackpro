'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Download, RefreshCw, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { useFleetReport } from './FleetReportContext';

export default function FleetReportOverviewPage() {
  const {
    loading,
    error,
    refresh,
    exportFullExcel,
    inspections,
    weekInspections,
    outstandingDefects,
    mileageRows,
    vehicles,
    weekBounds,
  } = useFleetReport();

  const anomalyCount = mileageRows.filter(
    (r) => r['Anomaly Flag'] === 'Yes' || r['Anomaly Flag'] === 'Review'
  ).length;

  return (
    <div className="space-y-8">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => exportFullExcel()}
          disabled={loading || inspections.length === 0}
          className="btn-dashboard-action inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 dark:border-green-500/40 dark:bg-transparent dark:text-green-400 dark:hover:bg-green-500/10"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export full Excel (all sheets)
        </button>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn-dashboard-action inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-50 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh data
        </button>
        <span className="text-zinc-500 dark:text-white/50 text-xs sm:text-sm">
          Loads last {365} days of inspections &amp; defects · Excel includes summary, mileage, defects, week log,
          compliance
        </span>
      </div>

      {loading && inspections.length === 0 ? (
        <p className="text-zinc-600 dark:text-white/60 text-sm flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading fleet data…
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="dashboard-card p-5">
            <p className="dashboard-kpi-value">{vehicles.length}</p>
            <p className="dashboard-kpi-label">Vehicles</p>
          </div>
          <div className="dashboard-card p-5">
            <p className="dashboard-kpi-value">{inspections.length}</p>
            <p className="dashboard-kpi-label">Inspections ({365}d)</p>
          </div>
          <div className="dashboard-card p-5">
            <p className="dashboard-kpi-value text-blue-700 dark:text-blue-400">{weekInspections.length}</p>
            <p className="dashboard-kpi-label">This week</p>
            <p className="text-zinc-500 dark:text-white/50 text-xs mt-1">
              {format(weekBounds.start, 'd MMM')} – {format(weekBounds.end, 'd MMM yyyy')}
            </p>
          </div>
          <div className="dashboard-card p-5">
            <p className={`dashboard-kpi-value ${anomalyCount > 0 ? 'text-amber-700 dark:text-amber-400' : ''}`}>
              {anomalyCount}
            </p>
            <p className="dashboard-kpi-label">Mileage flags</p>
            <p className="text-zinc-500 dark:text-white/50 text-xs mt-1">Rollback / high daily / missing</p>
          </div>
          <Link
            href="/dashboard/defects?status=open"
            className="dashboard-card p-5 col-span-2 lg:col-span-4 hover:bg-zinc-50 dark:hover:bg-white/[0.08] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <p className="dashboard-kpi-value text-red-700 dark:text-red-300">{outstandingDefects.length}</p>
            <p className="dashboard-kpi-label">Outstanding defects (not resolved)</p>
            <p className="text-zinc-500 dark:text-white/50 text-xs mt-1">Open in Defects &rarr;</p>
          </Link>
        </div>
      )}

      <div className="dashboard-card p-6 space-y-3">
        <h2 className="dashboard-section-title flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          Report sections
        </h2>
        <ul className="text-zinc-700 dark:text-white/70 text-sm space-y-2 list-disc list-inside">
          <li>
            <strong className="text-zinc-900 dark:text-white">Mileage &amp; anomalies</strong> — every inspection with delta vs
            previous read, flagged issues.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-white">This week</strong> — chronological inspection log for the current
            Monday–Sunday window.
          </li>
          <li>
            <strong className="text-zinc-900 dark:text-white">Who checked</strong> — field users (user/manager roles) with inspection
            counts this week; vehicles and whether they were inspected.
          </li>
        </ul>
      </div>
    </div>
  );
}
