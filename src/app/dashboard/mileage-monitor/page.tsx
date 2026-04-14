'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Gauge } from 'lucide-react';
import { FleetReportProvider, useFleetReport } from '../fleet-report/FleetReportContext';
import { buildMileageMonitoringRows } from '@/lib/fleetReportLogic';

function levelBadge() {
  return 'bg-slate-900/70 text-slate-100 border-slate-600/60';
}

function levelDot(level: string) {
  if (level === 'critical') return 'bg-red-300';
  if (level === 'high') return 'bg-amber-300';
  if (level === 'watch') return 'bg-yellow-300';
  if (level === 'stale') return 'bg-sky-300';
  if (level === 'insufficient') return 'bg-slate-300';
  return 'bg-emerald-300';
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

function signedMileage(delta: number) {
  const abs = Math.abs(delta).toLocaleString();
  if (delta > 0) return `+${abs} mi`;
  if (delta < 0) return `-${abs} mi`;
  return '0 mi';
}

function movementTone(delta: number) {
  if (delta > 0) return 'text-blue-200';
  if (delta < 0) return 'text-slate-200';
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

function statusPanelBorder(level: string) {
  if (level === 'critical') return 'border-l-red-300';
  if (level === 'high') return 'border-l-amber-300';
  if (level === 'watch') return 'border-l-yellow-300';
  if (level === 'stale') return 'border-l-sky-300';
  if (level === 'insufficient') return 'border-l-slate-300';
  return 'border-l-emerald-300';
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
        <div className="space-y-3">
          {filteredRows.length === 0 ? (
            <div className="dashboard-card px-4 py-6 text-white/50 text-sm">No vehicles match this filter.</div>
          ) : null}
          {filteredRows.map((row) => {
            const deltaVsLast = row.currentWeekMiles - row.lastWeekMiles;
            const deltaVsBaseline =
              row.baselineWeeklyMiles > 0 ? row.currentWeekMiles - row.baselineWeeklyMiles : null;
            return (
              <article
                key={row.vehicleId}
                className={`dashboard-card border-l-2 ${statusPanelBorder(row.anomalyLevel)} ${rowTint(row.anomalyLevel)} p-3`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold tracking-wide">{row.registration}</p>
                    <p className="text-[11px] text-white/55 mt-0.5 tabular-nums">
                      Odometer: {row.latestMileage != null ? `${row.latestMileage.toLocaleString()} mi` : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex min-w-[48px] justify-center px-2 py-0.5 rounded-md border border-white/15 text-white/90 text-xs tabular-nums">
                      {row.riskScore}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${levelBadge()}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${levelDot(row.anomalyLevel)}`} />
                      {levelLabel(row.anomalyLevel)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
                  <div className="rounded-lg border border-white/10 bg-black/25 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-white/45">Scored week</p>
                    <p className="text-sm text-white/90 tabular-nums mt-0.5">
                      {row.scoredWeekMiles.toLocaleString()} mi
                    </p>
                    <p className="text-[10px] text-white/45 mt-0.5">{row.scoredWeekLabel}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/25 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-white/45">Movement</p>
                    <p className={`text-xs mt-0.5 ${deltaVsBaseline == null ? 'text-slate-300' : movementTone(deltaVsBaseline)}`}>
                      Baseline: {deltaVsBaseline == null ? 'No baseline yet' : signedMileage(deltaVsBaseline)}
                    </p>
                    <p className={`text-xs mt-0.5 ${movementTone(deltaVsLast)}`}>
                      Week-on-week: {signedMileage(deltaVsLast)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/25 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-white/45">Inspection quality</p>
                    <p className="text-xs text-white/75 mt-0.5 tabular-nums">
                      Checks: {row.validMileageCount}/{row.inspectionCount}
                    </p>
                    <p className="text-xs text-white/60 mt-0.5 tabular-nums">
                      Data: {row.dataWeeks}/8 weeks
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/25 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-white/45">Last check</p>
                    <p className="text-xs text-white/75 mt-0.5">{row.latestInspectionAt}</p>
                    <p className={`text-xs mt-0.5 capitalize ${confidenceBadge(row.confidence)}`}>
                      {row.confidence} confidence
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-1 xl:grid-cols-2 gap-2">
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    <span className="text-white/50">Reason:</span> {row.anomalyReason}
                  </p>
                  <p className="text-[11px] text-white/75 leading-relaxed">
                    <span className="text-white/50">Action:</span> {row.recommendedAction}
                  </p>
                </div>
              </article>
            );
          })}
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
