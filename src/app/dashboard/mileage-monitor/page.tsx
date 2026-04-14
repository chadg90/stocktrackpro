'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Gauge } from 'lucide-react';
import { FleetReportProvider, useFleetReport } from '../fleet-report/FleetReportContext';
import { buildMileageMonitoringRows } from '@/lib/fleetReportLogic';

function levelBadge(level: string) {
  if (level === 'critical') return 'bg-red-500/15 text-red-300 border-red-500/30';
  if (level === 'high') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (level === 'watch') return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
  if (level === 'stale') return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
  if (level === 'insufficient') return 'bg-white/10 text-white/60 border-white/20';
  return 'bg-green-500/10 text-green-300 border-green-500/30';
}

function levelLabel(level: string) {
  if (level === 'critical') return 'Critical risk';
  if (level === 'high') return 'High risk';
  if (level === 'watch') return 'Watch';
  if (level === 'stale') return 'Stale check-ins';
  if (level === 'insufficient') return 'Insufficient data';
  return 'Normal';
}

function confidenceBadge(confidence: string) {
  if (confidence === 'high') return 'text-green-300';
  if (confidence === 'medium') return 'text-yellow-300';
  return 'text-white/50';
}

function rowTint(level: string) {
  if (level === 'critical') return 'bg-red-500/[0.04]';
  if (level === 'high') return 'bg-amber-500/[0.04]';
  if (level === 'watch') return 'bg-yellow-500/[0.03]';
  if (level === 'stale') return 'bg-sky-500/[0.03]';
  if (level === 'insufficient') return 'bg-white/[0.02]';
  return '';
}

function MileageMonitorContent() {
  const { loading, error, inspections, vehicles } = useFleetReport();
  const [filter, setFilter] = useState<'all' | 'risk' | 'stale' | 'insufficient'>('all');
  const rows = useMemo(
    () => buildMileageMonitoringRows(inspections, vehicles),
    [inspections, vehicles]
  );

  const criticalCount = rows.filter((r) => r.anomalyLevel === 'critical').length;
  const highCount = rows.filter((r) => r.anomalyLevel === 'high').length;
  const watchCount = rows.filter((r) => r.anomalyLevel === 'watch').length;
  const staleCount = rows.filter((r) => r.anomalyLevel === 'stale').length;
  const insufficientCount = rows.filter((r) => r.anomalyLevel === 'insufficient').length;
  const needsReviewCount = criticalCount + highCount + watchCount;
  const avgRiskScore = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.riskScore, 0) / rows.length)
    : 0;
  const filteredRows = useMemo(() => {
    if (filter === 'risk') {
      return rows.filter(
        (r) => r.anomalyLevel === 'critical' || r.anomalyLevel === 'high' || r.anomalyLevel === 'watch'
      );
    }
    if (filter === 'stale') return rows.filter((r) => r.anomalyLevel === 'stale');
    if (filter === 'insufficient') return rows.filter((r) => r.anomalyLevel === 'insufficient');
    return rows;
  }, [rows, filter]);

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 space-y-3">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-white flex items-center gap-2">
            <Gauge className="h-6 w-6 text-blue-400" />
            Mileage Monitor
          </h1>
          <p className="text-white/65 mt-1.5 max-w-3xl text-sm">
            Weekly monitoring built for sporadic check-ins. Alerts compare current-week mileage against each
            vehicle&apos;s recent baseline, with confidence scoring based on available data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Critical</p>
          <p className="text-2xl font-semibold text-red-300 mt-1">{criticalCount}</p>
          <p className="text-xs text-white/55 mt-1">Very strong anomaly vs normal pattern.</p>
        </div>
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">High</p>
          <p className="text-2xl font-semibold text-amber-300 mt-1">{highCount}</p>
          <p className="text-xs text-white/55 mt-1">Significant deviation requiring review.</p>
        </div>
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Watch</p>
          <p className="text-2xl font-semibold text-yellow-300 mt-1">{watchCount}</p>
          <p className="text-xs text-white/55 mt-1">Above trend, monitor next check-in.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Stale check-ins</p>
          <p className="text-2xl font-semibold text-sky-300 mt-1">{staleCount}</p>
          <p className="text-xs text-white/55 mt-1">Sufficient history, but no current-week check logged yet.</p>
        </div>
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Insufficient data</p>
          <p className="text-2xl font-semibold text-white/80 mt-1">{insufficientCount}</p>
          <p className="text-xs text-white/55 mt-1">Usually means zero or one valid mileage reading.</p>
        </div>
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Vehicles monitored</p>
          <p className="text-2xl font-semibold text-blue-300 mt-1">{rows.length}</p>
          <p className="text-xs text-white/55 mt-1">All fleet vehicles are listed, even with limited data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Needs review now</p>
          <p className="text-2xl font-semibold text-white mt-1">{needsReviewCount}</p>
          <p className="text-xs text-white/55 mt-1">Critical, High, and Watch items combined.</p>
        </div>
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Average risk score</p>
          <p className="text-2xl font-semibold text-white mt-1">{avgRiskScore}/100</p>
          <p className="text-xs text-white/55 mt-1">Higher means a riskier fleet profile this week.</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-white/75">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-blue-300" />
          <p>
            This view is an investigation aid, not proof on its own. Use confidence, inspection frequency, and
            manager context before making decisions.
          </p>
        </div>
      </div>

      <div className="dashboard-card p-3">
        <p className="text-white font-medium mb-2">Status guide</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/75">
          <p><span className="text-red-300 font-medium">Critical risk:</span> very large deviation or rollback pattern detected.</p>
          <p><span className="text-amber-300 font-medium">High risk:</span> significant increase compared with baseline trend.</p>
          <p><span className="text-yellow-300 font-medium">Watch:</span> above expected trend; review after next check.</p>
          <p><span className="text-sky-300 font-medium">Stale check-ins:</span> historic data exists but no current-week check-in yet.</p>
          <p><span className="text-white/80 font-medium">Insufficient data:</span> fewer than two valid mileage readings.</p>
        </div>
      </div>

      <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
        {[
          { id: 'all', label: `All (${rows.length})` },
          { id: 'risk', label: `Needs review (${criticalCount + highCount + watchCount})` },
          { id: 'stale', label: `Stale (${staleCount})` },
          { id: 'insufficient', label: `Insufficient (${insufficientCount})` },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id as typeof filter)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
              filter === item.id
                ? 'bg-blue-500/25 border-blue-400/60 text-blue-100 shadow-[0_0_0_1px_rgba(96,165,250,0.2)]'
                : 'bg-slate-700/35 border-slate-400/40 text-white/90 hover:text-white hover:bg-slate-600/40'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-red-300 text-sm">{error}</p> : null}
      {loading && filteredRows.length === 0 ? (
        <p className="text-white/50 text-sm">Loading mileage monitoring data…</p>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[1080px]">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="px-3 py-1.5 font-medium">Registration</th>
                <th className="px-3 py-1.5 font-medium">Risk score</th>
                <th className="px-3 py-1.5 font-medium">Latest odometer</th>
                <th className="px-3 py-1.5 font-medium">Last check</th>
                <th className="px-3 py-1.5 font-medium">Checks</th>
                <th className="px-3 py-1.5 font-medium">Scored week</th>
                <th className="px-3 py-1.5 font-medium">Trend summary</th>
                <th className="px-3 py-1.5 font-medium">Status</th>
                <th className="px-3 py-1.5 font-medium">Confidence</th>
                <th className="px-3 py-1.5 font-medium">Reason</th>
                <th className="px-3 py-1.5 font-medium">Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.vehicleId} className={`border-b border-white/5 ${rowTint(row.anomalyLevel)}`}>
                  <td className="px-3 py-1.5 text-white font-medium">{row.registration}</td>
                  <td className="px-3 py-1.5">
                    <span className="inline-flex min-w-[48px] justify-center px-2 py-0.5 rounded-md border border-white/15 text-white/90 tabular-nums">
                      {row.riskScore}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-white/85 tabular-nums">
                    {row.latestMileage != null ? `${row.latestMileage.toLocaleString()} mi` : '—'}
                  </td>
                  <td className="px-3 py-1.5 text-white/70">
                    <span className="whitespace-nowrap">{row.latestInspectionAt}</span>
                    <span className="block text-[10px] text-white/45 mt-0.5 tabular-nums">
                      {row.daysSinceLastInspection != null ? `${row.daysSinceLastInspection}d ago` : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-white/70">
                    {row.validMileageCount}/{row.inspectionCount}
                  </td>
                  <td className="px-3 py-1.5 text-white/80 tabular-nums">
                    {row.scoredWeekMiles.toLocaleString()} mi
                    <span className="block text-[10px] text-white/45 mt-0.5">{row.scoredWeekLabel}</span>
                  </td>
                  <td className="px-3 py-1.5 text-white/75 tabular-nums">
                    <span className="block">This: {row.currentWeekMiles.toLocaleString()} mi</span>
                    <span className="block text-white/60">Last: {row.lastWeekMiles.toLocaleString()} mi</span>
                    <span className="block text-white/60">Avg: {row.avgWeeklyMiles.toLocaleString()} mi</span>
                    <span className="block text-white/50">
                      Base: {row.baselineWeeklyMiles > 0 ? `${row.baselineWeeklyMiles.toLocaleString()} mi` : '—'} · {row.dataWeeks}/8 weeks
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border capitalize ${levelBadge(row.anomalyLevel)}`}>
                      {levelLabel(row.anomalyLevel)}
                    </span>
                  </td>
                  <td className={`px-3 py-1.5 capitalize ${confidenceBadge(row.confidence)}`}>{row.confidence}</td>
                  <td className="px-3 py-1.5 text-white/65">{row.anomalyReason}</td>
                  <td className="px-3 py-1.5 text-white/70">{row.recommendedAction}</td>
                </tr>
              ))}
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-6 text-white/50">
                    No vehicles match this filter.
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
