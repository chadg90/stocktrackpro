'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gauge } from 'lucide-react';
import { FleetReportProvider, useFleetReport } from '../fleet-report/FleetReportContext';
import { buildMileageMonitoringRows } from '@/lib/fleetReportLogic';

function levelBadge() {
  return 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-slate-900/70 dark:text-slate-100 dark:border-slate-600/60';
}

type StatusTone = 'critical' | 'high' | 'watch' | 'missing' | 'normal';

function normalizeStatus(level: string): StatusTone {
  if (level === 'critical') return 'critical';
  if (level === 'high') return 'high';
  if (level === 'watch') return 'watch';
  if (level === 'stale' || level === 'insufficient') return 'missing';
  return 'normal';
}

function levelLabel(status: StatusTone) {
  if (status === 'critical') return 'Critical';
  if (status === 'high') return 'High';
  if (status === 'watch') return 'Watch';
  if (status === 'missing') return 'Missing data';
  return 'Normal';
}

function confidenceBadge(confidence: string) {
  if (confidence === 'high') return 'text-emerald-700 dark:text-emerald-200';
  if (confidence === 'medium') return 'text-amber-700 dark:text-amber-200';
  return 'text-zinc-600 dark:text-slate-300';
}

function baselineSummary(delta: number | null) {
  if (delta == null) return 'No baseline yet';
  const miles = `${Math.abs(delta).toLocaleString()} mi`;
  if (delta > 0) return `${miles} above normal`;
  if (delta < 0) return `${miles} below normal`;
  return 'On normal baseline';
}

function scoredWeekTitle(scoredWeekLabel: string) {
  if (scoredWeekLabel === 'Current week') return 'Current week';
  if (scoredWeekLabel.startsWith('Week of ')) return 'Latest logged week';
  return 'Week data';
}

function shortWeekLabel(weekStart: string) {
  const d = new Date(`${weekStart}T00:00:00`);
  if (Number.isNaN(d.getTime())) return weekStart;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function movementTone(delta: number) {
  if (delta > 0) return 'text-blue-700 dark:text-blue-200';
  if (delta < 0) return 'text-zinc-700 dark:text-slate-200';
  return 'text-zinc-600 dark:text-slate-300';
}

function rowTint(level: string) {
  if (level === 'critical') return 'bg-zinc-100 dark:bg-zinc-900/45';
  if (level === 'high') return 'bg-zinc-100 dark:bg-zinc-900/45';
  if (level === 'watch') return 'bg-zinc-100 dark:bg-zinc-900/45';
  if (level === 'stale') return 'bg-zinc-100 dark:bg-zinc-900/45';
  if (level === 'insufficient') return 'bg-zinc-100 dark:bg-zinc-900/45';
  return '';
}

function statusPanelBorder(status: StatusTone) {
  if (status === 'critical') return 'border-l-red-300';
  if (status === 'high') return 'border-l-amber-300';
  if (status === 'watch') return 'border-l-yellow-300';
  if (status === 'missing') return 'border-l-slate-300';
  return 'border-l-emerald-300';
}

function statusCardAccent(status: StatusTone) {
  if (status === 'critical') return 'bg-red-700 dark:bg-red-300';
  if (status === 'high') return 'bg-amber-700 dark:bg-amber-300';
  if (status === 'watch') return 'bg-yellow-700 dark:bg-yellow-300';
  if (status === 'missing') return 'bg-slate-600 dark:bg-slate-300';
  return 'bg-emerald-700 dark:bg-emerald-300';
}

function MileageMonitorContent() {
  const { loading, error, inspections, vehicles } = useFleetReport();
  const [filter, setFilter] = useState<'all' | 'attention' | 'missing' | 'normal'>('all');
  const rows = useMemo(
    () => buildMileageMonitoringRows(inspections, vehicles),
    [inspections, vehicles]
  );

  const criticalCount = rows.filter((r) => r.anomalyLevel === 'critical').length;
  const highCount = rows.filter((r) => r.anomalyLevel === 'high').length;
  const watchCount = rows.filter((r) => r.anomalyLevel === 'watch').length;
  const staleCount = rows.filter((r) => r.anomalyLevel === 'stale').length;
  const insufficientCount = rows.filter((r) => r.anomalyLevel === 'insufficient').length;
  const missingDataCount = staleCount + insufficientCount;
  const needsReviewCount = criticalCount + highCount + watchCount;
  const normalCount = rows.filter((r) => normalizeStatus(r.anomalyLevel) === 'normal').length;
  const avgRiskScore = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.riskScore, 0) / rows.length)
    : 0;
  const filteredRows = useMemo(() => {
    if (filter === 'attention') {
      return rows.filter(
        (r) => r.anomalyLevel === 'critical' || r.anomalyLevel === 'high' || r.anomalyLevel === 'watch'
      );
    }
    if (filter === 'missing') {
      return rows.filter((r) => r.anomalyLevel === 'stale' || r.anomalyLevel === 'insufficient');
    }
    if (filter === 'normal') {
      return rows.filter((r) => normalizeStatus(r.anomalyLevel) === 'normal');
    }
    return rows;
  }, [rows, filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 text-zinc-900 dark:text-white">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors dark:text-white/60 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </Link>

      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-[30px] font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Gauge className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Mileage Monitor
          </h1>
          <p className="text-zinc-600 dark:text-white/65 mt-1.5 max-w-3xl text-sm">
            Quick anomaly view for fleet mileage with clear status, risk, and trend context.
          </p>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-[11px] text-zinc-700 dark:border-slate-500/50 dark:bg-slate-800/60 dark:text-slate-200">
          Status: Normal, Watch, High, Critical, Missing data
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
        <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-blue-500/25 dark:bg-black">
          <p className="text-zinc-500 dark:text-white/60 text-xs uppercase tracking-wider">Fleet monitored</p>
          <p className="text-xl font-semibold text-zinc-900 dark:text-white mt-1">{rows.length}</p>
          <p className="text-[11px] text-zinc-500 dark:text-white/55 mt-1">Vehicles in this period.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-blue-500/25 dark:bg-black">
          <p className="text-zinc-500 dark:text-white/60 text-xs uppercase tracking-wider">Needs attention</p>
          <p className="text-xl font-semibold text-red-700 dark:text-red-200 mt-1">{needsReviewCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-white/55 mt-1">Watch, High, and Critical.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-blue-500/25 dark:bg-black">
          <p className="text-zinc-500 dark:text-white/60 text-xs uppercase tracking-wider">Missing data</p>
          <p className="text-xl font-semibold text-zinc-700 dark:text-slate-200 mt-1">{missingDataCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-white/55 mt-1">No check or too little data.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-blue-500/25 dark:bg-black">
          <p className="text-zinc-500 dark:text-white/60 text-xs uppercase tracking-wider">Healthy vehicles</p>
          <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-200 mt-1">{normalCount}</p>
          <p className="text-[11px] text-zinc-500 dark:text-white/55 mt-1">Currently normal trend.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-blue-500/25 dark:bg-black">
          <p className="text-zinc-500 dark:text-white/60 text-xs uppercase tracking-wider">Average risk score</p>
          <p className="text-xl font-semibold text-blue-700 dark:text-blue-200 mt-1">{avgRiskScore}</p>
          <p className="text-[11px] text-zinc-500 dark:text-white/55 mt-1">Out of 100.</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-blue-500/25 dark:bg-black">
        <p className="text-xs uppercase tracking-wide font-semibold text-zinc-600 dark:text-white/60">
          How scoring works
        </p>
        <p className="text-sm text-zinc-700 dark:text-white/75 mt-1 leading-relaxed">
          The score is out of 100 and combines anomaly level, data confidence, and stale-check timing. Higher
          scores mean higher review priority.
        </p>
        <p className="text-xs text-zinc-600 dark:text-white/65 mt-2 leading-relaxed">
          Base levels: Normal 18, Missing data 24-40, Watch 62, High 80, Critical 95. Confidence can raise the
          score, and stale vehicles may get an extra boost if inspections are overdue.
        </p>
      </div>

      <div className="inline-flex flex-wrap items-center gap-1.5">
        {[
          { id: 'all', label: `All (${rows.length})` },
          { id: 'attention', label: `Needs attention (${needsReviewCount})` },
          { id: 'missing', label: `Missing data (${missingDataCount})` },
          { id: 'normal', label: `Normal (${normalCount})` },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id as typeof filter)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filter === item.id
                ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500/35 dark:border-blue-300/70'
                : 'bg-white border-zinc-300 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:bg-slate-700/45 dark:border-slate-300/35 dark:text-slate-100 dark:hover:text-white dark:hover:bg-slate-600/50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-red-700 dark:text-red-300 text-sm">{error}</p> : null}
      {loading && filteredRows.length === 0 ? (
        <p className="text-zinc-500 dark:text-white/50 text-sm">Loading mileage monitoring data…</p>
      ) : (
        <div className="space-y-3">
          {filteredRows.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-6 text-zinc-500 text-sm dark:border-blue-500/25 dark:bg-black dark:text-white/50">No vehicles match this filter.</div>
          ) : null}
          {filteredRows.map((row) => {
            const deltaVsBaseline =
              row.baselineWeeklyMiles > 0 ? row.currentWeekMiles - row.baselineWeeklyMiles : null;
            const status = normalizeStatus(row.anomalyLevel);
            const weeklySeries = row.recentWeeklyMiles.slice().reverse();
            const maxWeeklyMiles = Math.max(1, ...weeklySeries.map((w) => w.miles));
            return (
              <article
                key={row.vehicleId}
                className={`rounded-xl border border-zinc-200 bg-white dark:border-blue-500/25 dark:bg-black border-l-2 ${statusPanelBorder(status)} ${rowTint(row.anomalyLevel)} p-4`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div>
                    <p className="text-zinc-900 dark:text-white text-[30px] font-bold tracking-wide leading-tight">{row.registration}</p>
                    <p className="text-xs text-zinc-700 dark:text-white/70 mt-1 tabular-nums font-medium">
                      Odometer: {row.latestMileage != null ? `${row.latestMileage.toLocaleString()} mi` : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex min-w-[48px] justify-center px-2.5 py-1 rounded-md border border-zinc-300 text-zinc-900 text-sm font-semibold tabular-nums dark:border-white/15 dark:text-white/95">
                      {row.riskScore}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold border ${levelBadge()}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCardAccent(status)}`} />
                      {levelLabel(status)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-black/25">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-zinc-600 dark:text-white/60">
                      {scoredWeekTitle(row.scoredWeekLabel)}
                    </p>
                    <p className="text-base font-semibold text-zinc-900 dark:text-white/95 tabular-nums mt-0.5">
                      {row.scoredWeekMiles.toLocaleString()} mi
                    </p>
                    <p className="text-xs text-zinc-700 dark:text-white/70 mt-0.5">{row.scoredWeekLabel}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-black/25">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-zinc-600 dark:text-white/60">Movement</p>
                    <p className={`text-sm font-medium mt-0.5 ${deltaVsBaseline == null ? 'text-zinc-700 dark:text-slate-200' : movementTone(deltaVsBaseline)}`}>
                      Vs baseline: {baselineSummary(deltaVsBaseline)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-black/25">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-zinc-600 dark:text-white/60">Inspection quality</p>
                    <p className="text-sm font-medium text-zinc-800 dark:text-white/85 mt-0.5 tabular-nums">
                      Checks: {row.validMileageCount}/{row.inspectionCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-black/25">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-zinc-600 dark:text-white/60">Last check</p>
                    <p className="text-sm font-medium text-zinc-800 dark:text-white/85 mt-0.5">{row.latestInspectionAt}</p>
                    <p className={`text-sm font-medium mt-0.5 capitalize ${confidenceBadge(row.confidence)}`}>
                      {row.confidence} confidence
                    </p>
                  </div>
                </div>

                <div className="mt-2.5">
                  <p className="text-sm text-zinc-900 dark:text-white/90 leading-relaxed font-medium">
                    <span className="text-zinc-700 dark:text-white/70 font-semibold">Last inspection date:</span>{' '}
                    {row.latestInspectionAt}
                  </p>
                </div>

                <div className="mt-2.5 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-white/10 dark:bg-black/25">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-zinc-600 dark:text-white/60">
                      Recent weekly mileage (6 weeks)
                    </p>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-white/75 tabular-nums">
                      Average: {row.avgWeeklyMiles.toLocaleString()} mi
                    </p>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {weeklySeries.map((week) => {
                      const widthPct = Math.max(6, Math.round((week.miles / maxWeeklyMiles) * 100));
                      return (
                        <div key={week.weekStart} className="grid grid-cols-[56px_1fr_auto] items-center gap-2">
                          <p className="text-[11px] font-medium text-zinc-600 dark:text-white/60">{shortWeekLabel(week.weekStart)}</p>
                          <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700/60 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${week.hasData ? 'bg-blue-600 dark:bg-blue-400' : 'bg-zinc-400 dark:bg-zinc-500'}`}
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                          <p className="text-[11px] font-semibold text-zinc-700 dark:text-white/75 tabular-nums">
                            {week.miles.toLocaleString()} mi
                          </p>
                        </div>
                      );
                    })}
                  </div>
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
