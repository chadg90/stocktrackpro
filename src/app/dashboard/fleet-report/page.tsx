'use client';

import React from 'react';
import { format } from 'date-fns';
import { Download, RefreshCw, FileSpreadsheet } from 'lucide-react';
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
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => exportFullExcel()}
          disabled={loading || inspections.length === 0}
          className="btn-dashboard-action inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export full Excel (all sheets)
        </button>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn-dashboard-action inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh data
        </button>
        <span className="text-white/40 text-xs sm:text-sm">
          Loads last {365} days of inspections &amp; defects · Excel includes summary, mileage, defects, week log,
          compliance
        </span>
      </div>

      {loading && inspections.length === 0 ? (
        <p className="text-white/50 text-sm flex items-center gap-2">
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
            <p className="dashboard-kpi-value text-blue-400">{weekInspections.length}</p>
            <p className="dashboard-kpi-label">This week</p>
            <p className="text-white/35 text-xs mt-1">
              {format(weekBounds.start, 'd MMM')} – {format(weekBounds.end, 'd MMM yyyy')}
            </p>
          </div>
          <div className="dashboard-card p-5">
            <p className={`dashboard-kpi-value ${anomalyCount > 0 ? 'text-amber-400' : ''}`}>
              {anomalyCount}
            </p>
            <p className="dashboard-kpi-label">Mileage flags</p>
            <p className="text-white/35 text-xs mt-1">Rollback / high daily / missing</p>
          </div>
          <div className="dashboard-card p-5 col-span-2 lg:col-span-4">
            <p className="dashboard-kpi-value text-red-300">{outstandingDefects.length}</p>
            <p className="dashboard-kpi-label">Outstanding defects (not resolved)</p>
          </div>
        </div>
      )}

      <div className="dashboard-card p-6 space-y-3">
        <h2 className="dashboard-section-title flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-400" />
          Report sections
        </h2>
        <ul className="text-white/65 text-sm space-y-2 list-disc list-inside">
          <li>
            <strong className="text-white">Mileage &amp; anomalies</strong> — every inspection with delta vs
            previous read, flagged issues.
          </li>
          <li>
            <strong className="text-white">Defects</strong> — all items in range plus what&apos;s still open.
          </li>
          <li>
            <strong className="text-white">This week</strong> — chronological inspection log for the current
            Monday–Sunday window.
          </li>
          <li>
            <strong className="text-white">Who checked</strong> — field users (user/manager roles) with inspection
            counts this week; vehicles and whether they were inspected.
          </li>
        </ul>
      </div>
    </div>
  );
}
