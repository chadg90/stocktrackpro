'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Gauge } from 'lucide-react';
import { FleetReportProvider, useFleetReport } from '../fleet-report/FleetReportContext';
import { buildMileageMonitoringRows } from '@/lib/fleetReportLogic';

function levelBadge(level: string) {
  if (level === 'critical') return 'bg-red-500/15 text-red-200 border-red-400/40';
  if (level === 'high') return 'bg-amber-500/15 text-amber-200 border-amber-400/40';
  if (level === 'watch') return 'bg-yellow-500/15 text-yellow-200 border-yellow-400/40';
  if (level === 'stale') return 'bg-sky-500/15 text-sky-200 border-sky-400/40';
  if (level === 'insufficient') return 'bg-slate-600/30 text-slate-200 border-slate-400/40';
  return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/40';
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
  if (confidence === 'high') return 'text-emerald-200';
  if (confidence === 'medium') return 'text-amber-200';
  return 'text-slate-300';
}

function rowTint(level: string) {
  if (level === 'critical') return 'bg-red-500/[0.03]';
  if (level === 'high') return 'bg-amber-500/[0.03]';
  if (level === 'watch') return 'bg-yellow-500/[0.02]';
  if (level === 'stale') return 'bg-sky-500/[0.02]';
  if (level === 'insufficient') return 'bg-slate-500/[0.03]';
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
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
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

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5">
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Critical</p>
          <p className="text-xl font-semibold text-red-200 mt-1">{criticalCount}</p>
          <p className="text-[11px] text-white/55 mt-1">Strong anomaly.</p>
        </div>
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">High</p>
          <p className="text-xl font-semibold text-amber-200 mt-1">{highCount}</p>
          <p className="text-[11px] text-white/55 mt-1">Needs review.</p>
        </div>
        <div className="dashboard-card p-3 hidden lg:block">
          <p className="text-white/60 text-xs uppercase tracking-wider">Watch</p>
          <p className="text-xl font-semibold text-yellow-200 mt-1">{watchCount}</p>
          <p className="text-[11px] text-white/55 mt-1">Above trend.</p>
        </div>
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Stale check-ins</p>
          <p className="text-xl font-semibold text-sky-200 mt-1">{staleCount}</p>
          <p className="text-[11px] text-white/55 mt-1">No current week check.</p>
        </div>
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Insufficient data</p>
          <p className="text-xl font-semibold text-slate-200 mt-1">{insufficientCount}</p>
          <p className="text-[11px] text-white/55 mt-1">Need more checks.</p>
        </div>
        <div className="dashboard-card p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider">Review now</p>
          <p className="text-xl font-semibold text-blue-200 mt-1">{needsReviewCount}</p>
          <p className="text-[11px] text-white/55 mt-1">Avg risk {avgRiskScore}/100.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/80">
          <p><span className="text-red-200 font-medium">Critical:</span> very large deviation or rollback detected.</p>
          <p><span className="text-amber-200 font-medium">High:</span> significant increase against baseline.</p>
          <p><span className="text-yellow-200 font-medium">Watch:</span> above expected trend; monitor next check.</p>
          <p><span className="text-sky-200 font-medium">Stale:</span> no current-week check-in yet.</p>
          <p><span className="text-slate-200 font-medium">Insufficient:</span> fewer than two valid mileage readings.</p>
        </div>
      </div>

      <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-500/35 bg-slate-700/20 p-1.5">
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
                ? 'bg-blue-500/35 border-blue-300/70 text-white'
                : 'bg-slate-700/45 border-slate-300/35 text-slate-100 hover:text-white hover:bg-slate-600/50'
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
        <div className="dashboard-card">
          <table className="w-full text-sm text-left table-fixed">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="w-[14%] px-2.5 py-2 font-medium">Vehicle</th>
                <th className="w-[9%] px-2.5 py-2 font-medium">Risk</th>
                <th className="w-[12%] px-2.5 py-2 font-medium">Last check</th>
                <th className="w-[10%] px-2.5 py-2 font-medium">Checks</th>
                <th className="w-[14%] px-2.5 py-2 font-medium">Scored week</th>
                <th className="w-[18%] px-2.5 py-2 font-medium">Trend</th>
                <th className="w-[10%] px-2.5 py-2 font-medium">Status</th>
                <th className="w-[13%] px-2.5 py-2 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.vehicleId} className={`border-b border-white/5 ${rowTint(row.anomalyLevel)}`}>
                  <td className="px-2.5 py-2 text-white font-medium">
                    <span className="block">{row.registration}</span>
                    <span className="block text-[10px] text-white/55 tabular-nums">
                      {row.latestMileage != null ? `${row.latestMileage.toLocaleString()} mi` : '—'}
                    </span>
                  </td>
                  <td className="px-2.5 py-2">
                    <span className="inline-flex min-w-[44px] justify-center px-1.5 py-0.5 rounded-md border border-white/15 text-white/90 tabular-nums">
                      {row.riskScore}
                    </span>
                  </td>
                  <td className="px-2.5 py-2 text-white/75">
                    <span className="whitespace-nowrap">{row.latestInspectionAt}</span>
                    <span className="block text-[10px] text-white/45 mt-0.5 tabular-nums">
                      {row.daysSinceLastInspection != null ? `${row.daysSinceLastInspection}d ago` : '—'}
                    </span>
                  </td>
                  <td className="px-2.5 py-2 text-white/70">
                    {row.validMileageCount}/{row.inspectionCount}
                  </td>
                  <td className="px-2.5 py-2 text-white/80 tabular-nums">
                    {row.scoredWeekMiles.toLocaleString()} mi
                    <span className="block text-[10px] text-white/45 mt-0.5">{row.scoredWeekLabel}</span>
                  </td>
                  <td className="px-2.5 py-2 text-white/75 text-xs tabular-nums">
                    <span className="block">This {row.currentWeekMiles.toLocaleString()} | Last {row.lastWeekMiles.toLocaleString()}</span>
                    <span className="block text-white/55">Avg {row.avgWeeklyMiles.toLocaleString()} | Base {row.baselineWeeklyMiles > 0 ? row.baselineWeeklyMiles.toLocaleString() : '—'}</span>
                    <span className="block text-white/45">
                      {row.dataWeeks}/8 weeks
                    </span>
                  </td>
                  <td className="px-2.5 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border capitalize ${levelBadge(row.anomalyLevel)}`}>
                      {levelLabel(row.anomalyLevel)}
                    </span>
                  </td>
                  <td className={`px-2.5 py-2 capitalize ${confidenceBadge(row.confidence)}`}>
                    <span className="block">{row.confidence}</span>
                    <span className="block text-[10px] text-white/50 mt-0.5 truncate" title={row.anomalyReason}>
                      {row.anomalyReason}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-white/50">
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
