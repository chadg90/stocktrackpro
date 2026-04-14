'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Gauge } from 'lucide-react';
import { FleetReportProvider, useFleetReport } from '../fleet-report/FleetReportContext';
import { buildMileageMonitoringRows } from '@/lib/fleetReportLogic';

function levelBadge(level: string) {
  if (level === 'critical') return 'bg-red-500/15 text-red-300 border-red-500/30';
  if (level === 'high') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (level === 'watch') return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
  if (level === 'insufficient') return 'bg-white/10 text-white/60 border-white/20';
  return 'bg-green-500/10 text-green-300 border-green-500/30';
}

function levelLabel(level: string) {
  if (level === 'critical') return 'Critical risk';
  if (level === 'high') return 'High risk';
  if (level === 'watch') return 'Watch';
  if (level === 'insufficient') return 'Insufficient data';
  return 'Normal';
}

function confidenceBadge(confidence: string) {
  if (confidence === 'high') return 'text-green-300';
  if (confidence === 'medium') return 'text-yellow-300';
  return 'text-white/50';
}

function MileageMonitorContent() {
  const { loading, error, inspections, vehicles } = useFleetReport();
  const rows = useMemo(
    () => buildMileageMonitoringRows(inspections, vehicles),
    [inspections, vehicles]
  );

  const criticalCount = rows.filter((r) => r.anomalyLevel === 'critical').length;
  const highCount = rows.filter((r) => r.anomalyLevel === 'high').length;
  const watchCount = rows.filter((r) => r.anomalyLevel === 'watch').length;
  const insufficientCount = rows.filter((r) => r.anomalyLevel === 'insufficient').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Gauge className="h-7 w-7 text-blue-400" />
            Mileage Monitor
          </h1>
          <p className="text-white/65 mt-2 max-w-3xl text-sm">
            Weekly monitoring built for sporadic check-ins. Alerts compare current-week mileage against each
            vehicle&apos;s recent baseline, with confidence scoring based on available data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dashboard-card p-4">
          <p className="text-white/60 text-xs uppercase tracking-wider">Critical</p>
          <p className="text-2xl font-semibold text-red-300 mt-1">{criticalCount}</p>
          <p className="text-xs text-white/55 mt-1">Very strong anomaly vs normal pattern.</p>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-white/60 text-xs uppercase tracking-wider">High</p>
          <p className="text-2xl font-semibold text-amber-300 mt-1">{highCount}</p>
          <p className="text-xs text-white/55 mt-1">Significant deviation requiring review.</p>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-white/60 text-xs uppercase tracking-wider">Watch</p>
          <p className="text-2xl font-semibold text-yellow-300 mt-1">{watchCount}</p>
          <p className="text-xs text-white/55 mt-1">Above trend, monitor next check-in.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="dashboard-card p-4">
          <p className="text-white/60 text-xs uppercase tracking-wider">Insufficient data</p>
          <p className="text-2xl font-semibold text-white/80 mt-1">{insufficientCount}</p>
          <p className="text-xs text-white/55 mt-1">Usually means 0-1 mileage checks or no check this week.</p>
        </div>
        <div className="dashboard-card p-4">
          <p className="text-white/60 text-xs uppercase tracking-wider">Vehicles monitored</p>
          <p className="text-2xl font-semibold text-blue-300 mt-1">{rows.length}</p>
          <p className="text-xs text-white/55 mt-1">All fleet vehicles are listed, even with limited data.</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-white/75">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-blue-300" />
          <p>
            This view is an investigation aid, not proof on its own. Use confidence, inspection frequency, and
            manager context before making decisions.
          </p>
        </div>
      </div>

      <div className="dashboard-card p-4">
        <p className="text-white font-medium mb-2">Status guide</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/75">
          <p><span className="text-red-300 font-medium">Critical risk:</span> very large deviation or rollback pattern detected.</p>
          <p><span className="text-amber-300 font-medium">High risk:</span> significant increase compared with baseline trend.</p>
          <p><span className="text-yellow-300 font-medium">Watch:</span> above expected trend; review after next check.</p>
          <p><span className="text-white/80 font-medium">Insufficient data:</span> not enough recent checks to score reliably.</p>
        </div>
      </div>

      {error ? <p className="text-red-300 text-sm">{error}</p> : null}
      {loading && rows.length === 0 ? (
        <p className="text-white/50 text-sm">Loading mileage monitoring data…</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[1320px]">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="px-3 py-2 font-medium">Registration</th>
                <th className="px-3 py-2 font-medium">Latest odometer</th>
                <th className="px-3 py-2 font-medium">Last check</th>
                <th className="px-3 py-2 font-medium">Checks</th>
                <th className="px-3 py-2 font-medium">Current week</th>
                <th className="px-3 py-2 font-medium">Last week</th>
                <th className="px-3 py-2 font-medium">8-week avg</th>
                <th className="px-3 py-2 font-medium">Baseline</th>
                <th className="px-3 py-2 font-medium">Data weeks</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Confidence</th>
                <th className="px-3 py-2 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.vehicleId} className="border-b border-white/5">
                  <td className="px-3 py-2 text-white font-medium">{row.registration}</td>
                  <td className="px-3 py-2 text-white/85 tabular-nums">
                    {row.latestMileage != null ? `${row.latestMileage.toLocaleString()} mi` : '—'}
                  </td>
                  <td className="px-3 py-2 text-white/70 whitespace-nowrap">{row.latestInspectionAt}</td>
                  <td className="px-3 py-2 text-white/70">
                    {row.validMileageCount}/{row.inspectionCount}
                  </td>
                  <td className="px-3 py-2 text-white tabular-nums">{row.currentWeekMiles.toLocaleString()} mi</td>
                  <td className="px-3 py-2 text-white/80 tabular-nums">{row.lastWeekMiles.toLocaleString()} mi</td>
                  <td className="px-3 py-2 text-white/80 tabular-nums">{row.avgWeeklyMiles.toLocaleString()} mi</td>
                  <td className="px-3 py-2 text-white/80 tabular-nums">
                    {row.baselineWeeklyMiles > 0 ? `${row.baselineWeeklyMiles.toLocaleString()} mi` : '—'}
                  </td>
                  <td className="px-3 py-2 text-white/70">{row.dataWeeks}/8</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border capitalize ${levelBadge(row.anomalyLevel)}`}>
                      {levelLabel(row.anomalyLevel)}
                    </span>
                  </td>
                  <td className={`px-3 py-2 capitalize ${confidenceBadge(row.confidence)}`}>{row.confidence}</td>
                  <td className="px-3 py-2 text-white/65">{row.anomalyReason}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-3 py-6 text-white/50">
                    No vehicles found for mileage monitoring.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function MileageMonitorPage() {
  return (
    <FleetReportProvider>
      <MileageMonitorContent />
    </FleetReportProvider>
  );
}
