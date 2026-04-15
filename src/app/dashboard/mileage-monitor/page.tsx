'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

function relativeTime(dateStr: string) {
  const parsed = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return 'unknown';
  const ms = Date.now() - parsed.getTime();
  if (ms < 0) return 'today';
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function formatLastCheckDate(dateStr: string) {
  const parsed = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeCsvCell(value: string | number) {
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function MileageMonitorContent() {
  const { loading, error, inspections, vehicles } = useFleetReport();
  const [filter, setFilter] = useState<'all' | 'attention' | 'missing' | 'normal'>('all');
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedWeekRows, setExpandedWeekRows] = useState<Record<string, boolean>>({});
  const [expandedMissingRows, setExpandedMissingRows] = useState<Record<string, boolean>>({});
  const [selectedMissingIds, setSelectedMissingIds] = useState<string[]>([]);
  const [showNormalSection, setShowNormalSection] = useState(false);
  const rows = useMemo(
    () => buildMileageMonitoringRows(inspections, vehicles),
    [inspections, vehicles]
  );

  const criticalCount = rows.filter((r) => r.anomalyLevel === 'critical').length;
  const highCount = rows.filter((r) => r.anomalyLevel === 'high').length;
  const staleCount = rows.filter((r) => r.anomalyLevel === 'stale').length;
  const insufficientCount = rows.filter((r) => r.anomalyLevel === 'insufficient').length;
  const missingDataCount = staleCount + insufficientCount;
  const needsReviewCount = criticalCount + highCount;
  const normalCount = rows.length - needsReviewCount - missingDataCount;

  const groupedRows = useMemo(() => {
    const needsAttention = rows
      .filter((r) => r.anomalyLevel === 'critical' || r.anomalyLevel === 'high')
      .sort((a, b) => b.riskScore - a.riskScore);
    const missing = rows
      .filter((r) => r.anomalyLevel === 'stale' || r.anomalyLevel === 'insufficient')
      .sort((a, b) => {
        const aDays = a.daysSinceLastInspection ?? -1;
        const bDays = b.daysSinceLastInspection ?? -1;
        return bDays - aDays;
      });
    const normal = rows.filter(
      (r) =>
        r.anomalyLevel !== 'critical' &&
        r.anomalyLevel !== 'high' &&
        r.anomalyLevel !== 'stale' &&
        r.anomalyLevel !== 'insufficient'
    );
    return { needsAttention, missing, normal };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === 'attention') {
      return groupedRows.needsAttention;
    }
    if (filter === 'missing') {
      return groupedRows.missing;
    }
    if (filter === 'normal') {
      return groupedRows.normal;
    }
    return rows;
  }, [rows, filter, groupedRows]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, rows.length]);
  useEffect(() => {
    setExpandedWeekRows({});
    setExpandedMissingRows({});
    setSelectedMissingIds([]);
  }, [filter, rows.length]);

  const visibleRows = filteredRows.slice(0, visibleCount);
  const missingCompact = groupedRows.missing.length > 5;
  const selectedMissingCount = selectedMissingIds.length;

  const toggleMissingSelection = (vehicleId: string) => {
    setSelectedMissingIds((prev) =>
      prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]
    );
  };

  const selectAllMissing = () => {
    const allIds = groupedRows.missing.map((r) => r.vehicleId);
    setSelectedMissingIds((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  const exportSelectedMissing = () => {
    const selected = groupedRows.missing.filter((r) => selectedMissingIds.includes(r.vehicleId));
    if (selected.length === 0) return;
    const header = ['Registration', 'Risk Score', 'Last Check', 'Days Since Last Check'];
    const lines = selected.map((row) =>
      [
        escapeCsvCell(row.registration),
        escapeCsvCell(row.riskScore),
        escapeCsvCell(row.latestInspectionAt),
        escapeCsvCell(row.daysSinceLastInspection ?? '—'),
      ].join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `missing-data-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderAlertStrip = (row: (typeof rows)[number]) => {
    const status = normalizeStatus(row.anomalyLevel);
    if (status === 'normal') return null;

    if (status === 'missing') {
      return (
        <div className="mt-2 border-t border-[#fde68a] bg-[#fffbeb] text-[#92400e] px-4 py-2 text-[12px]">
          No data received since {formatLastCheckDate(row.latestInspectionAt)} — tracker may be offline or disconnected
        </div>
      );
    }

    if ((row.anomalyLevel === 'high' || row.anomalyLevel === 'critical') && row.confidence === 'low') {
      const weekDate = row.scoredWeekLabel.replace('Week of ', '');
      const lastCheckRelative = row.daysSinceLastInspection != null ? `${row.daysSinceLastInspection} days ago` : relativeTime(row.latestInspectionAt);
      return (
        <div className="mt-2 border-t border-[#fecaca] bg-[#fef2f2] text-[#991b1b] px-4 py-2 text-[12px]">
          Spike detected week of {weekDate} — {row.scoredWeekMiles.toLocaleString()} mi vs {row.avgWeeklyMiles.toLocaleString()} mi avg · Low confidence · Last check {lastCheckRelative}
        </div>
      );
    }

    return null;
  };

  const renderVehicleCard = (row: (typeof rows)[number], options?: { showMissingCheckbox?: boolean; compactMissing?: boolean }) => {
    const status = normalizeStatus(row.anomalyLevel);
    const weeklySeries = row.recentWeeklyMiles;
    const nonZeroMiles = weeklySeries.map((w) => w.miles).filter((m) => m > 0);
    const avgSixWeek = nonZeroMiles.length
      ? Math.round(nonZeroMiles.reduce((sum, m) => sum + m, 0) / nonZeroMiles.length)
      : 0;
    const maxWeeklyMiles = Math.max(1, ...weeklySeries.map((w) => w.miles));
    const compactMissing = !!options?.compactMissing;
    const isExpandedMissing = !!expandedMissingRows[row.vehicleId];
    const showAsCompact = compactMissing && !isExpandedMissing;

    if (showAsCompact) {
      return (
        <div
          key={row.vehicleId}
          className="rounded-lg border border-zinc-200 bg-white dark:border-blue-500/25 dark:bg-black h-11 px-3 flex items-center gap-3"
        >
          {options?.showMissingCheckbox ? (
            <input
              type="checkbox"
              checked={selectedMissingIds.includes(row.vehicleId)}
              onChange={() => toggleMissingSelection(row.vehicleId)}
              className="h-4 w-4 rounded border-zinc-300"
            />
          ) : null}
          <p className="text-sm font-semibold text-zinc-900 dark:text-white min-w-[90px]">{row.registration}</p>
          <p className="text-xs text-zinc-700 dark:text-white/70 tabular-nums min-w-[130px]">
            {row.latestMileage != null ? `${row.latestMileage.toLocaleString()} mi` : '—'}
          </p>
          <p className="text-xs text-zinc-700 dark:text-white/70 flex-1">
            Last seen: {formatLastCheckDate(row.latestInspectionAt)} ({relativeTime(row.latestInspectionAt)})
          </p>
          <button
            type="button"
            onClick={() => setExpandedMissingRows((prev) => ({ ...prev, [row.vehicleId]: true }))}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
          >
            View →
          </button>
        </div>
      );
    }

    return (
      <article
        key={row.vehicleId}
        className={`rounded-xl border border-zinc-200 bg-white dark:border-blue-500/25 dark:bg-black border-l-2 ${statusPanelBorder(status)} ${rowTint(row.anomalyLevel)} p-3`}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div className="flex items-start gap-2">
            {options?.showMissingCheckbox ? (
              <input
                type="checkbox"
                checked={selectedMissingIds.includes(row.vehicleId)}
                onChange={() => toggleMissingSelection(row.vehicleId)}
                className="mt-1 h-4 w-4 rounded border-zinc-300"
              />
            ) : null}
            <div>
              <p className="text-zinc-900 dark:text-white text-[26px] font-bold tracking-wide leading-tight">{row.registration}</p>
              <p className="text-xs text-zinc-700 dark:text-white/70 mt-1 tabular-nums font-medium">
                Odometer: {row.latestMileage != null ? `${row.latestMileage.toLocaleString()} mi` : '—'}
              </p>
            </div>
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

        {renderAlertStrip(row)}

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
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
            <p className="text-[11px] uppercase tracking-wide font-semibold text-zinc-600 dark:text-white/60">Inspection quality</p>
            <p className="text-sm font-medium text-zinc-800 dark:text-white/85 mt-0.5 tabular-nums">
              Checks: {row.validMileageCount}/{row.inspectionCount}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-black/25">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-zinc-600 dark:text-white/60">Last check</p>
            <p className="text-sm font-medium text-zinc-800 dark:text-white/85 mt-0.5">{formatLastCheckDate(row.latestInspectionAt)}</p>
            <p
              className={`text-[11px] mt-0.5 ${
                (row.daysSinceLastInspection ?? 0) > 14 ? 'text-[#991b1b]' : 'text-zinc-500 dark:text-white/60'
              }`}
            >
              {relativeTime(row.latestInspectionAt)}
            </p>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-zinc-900 dark:text-white/90 leading-relaxed font-medium">
            <span className="text-zinc-700 dark:text-white/70 font-semibold">Last inspection date:</span>{' '}
            {row.latestInspectionAt}
          </p>
        </div>

        <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-black/25">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.07em] font-medium text-zinc-500 dark:text-white/60">6-week mileage</p>
            <p className="text-[10px] text-zinc-500 dark:text-white/60">Avg {avgSixWeek.toLocaleString()} mi</p>
          </div>
          <div className="mt-2 space-y-1.5">
            {weeklySeries.map((week) => {
              const widthPct = Math.max(6, Math.round((week.miles / maxWeeklyMiles) * 100));
              const weekRowKey = `${row.vehicleId}:${week.weekStart}`;
              const isExpanded = !!expandedWeekRows[weekRowKey];
              const isSpike = avgSixWeek > 0 && week.miles > avgSixWeek * 1.5;
              const trackerGap = week.checkCount === 0 && week.miles === 0;
              const confirmedIdle = week.checkCount > 0 && week.miles === 0;
              return (
                <div key={week.weekStart}>
                  <div className="grid grid-cols-[56px_1fr_auto_auto] items-center gap-2">
                    <p className="text-[11px] font-medium text-zinc-600 dark:text-white/60">
                      {shortWeekLabel(week.weekStart)}
                    </p>
                    <div
                      className={`h-1.5 rounded-full overflow-hidden ${
                        trackerGap
                          ? 'bg-[repeating-linear-gradient(90deg,#d4d4d8_0,#d4d4d8_6px,transparent_6px,transparent_10px)]'
                          : 'bg-zinc-200 dark:bg-zinc-700/60'
                      }`}
                    >
                      {confirmedIdle ? null : (
                        <div
                          className={`h-full rounded-full ${
                            isSpike
                              ? 'bg-[#378ADD]'
                              : week.hasData
                                ? 'bg-blue-300 dark:bg-blue-400/70'
                                : 'bg-zinc-400 dark:bg-zinc-500'
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      )}
                    </div>
                    {isSpike ? <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" /> : <span className="h-1.5 w-1.5" />}
                    <p
                      className={`text-[11px] tabular-nums text-right ${
                        isSpike
                          ? 'text-[#185FA5] font-medium'
                          : 'text-zinc-700 dark:text-white/75 font-semibold'
                      }`}
                    >
                      {week.miles.toLocaleString()} mi
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 pl-[56px]">
                    <p className="text-[10px] text-zinc-600 dark:text-white/60">
                      {week.checkCount} check{week.checkCount === 1 ? '' : 's'}
                    </p>
                    {week.checkCount > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedWeekRows((prev) => ({
                            ...prev,
                            [weekRowKey]: !prev[weekRowKey],
                          }))
                        }
                        className="text-[10px] font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        {isExpanded ? 'Hide logs' : 'Show logs'}
                      </button>
                    ) : null}
                  </div>
                  {isExpanded && week.entries.length > 0 ? (
                    <div className="mt-1.5 pl-[56px] space-y-1">
                      {week.entries.slice().reverse().map((entry, idx) => (
                        <p key={`${week.weekStart}-${idx}`} className="text-[10px] text-zinc-600 dark:text-white/60 tabular-nums">
                          {entry.inspectedAt} - {entry.mileage.toLocaleString()} mi
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </article>
    );
  };

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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px]">
        <div className="rounded-[8px] border border-zinc-200 bg-zinc-100 px-[14px] py-[12px] dark:border-blue-500/25 dark:bg-black">
          <p className="text-[11px] text-zinc-500 dark:text-white/60">Total fleet</p>
          <p className="text-[22px] font-medium text-zinc-900 dark:text-white mt-1">{rows.length}</p>
        </div>
        <div className="rounded-[8px] border border-[#fecaca] bg-[#fef2f2] px-[14px] py-[12px]">
          <p className="text-[11px] text-[#991b1b]/80">Needs attention</p>
          <p className="text-[22px] font-medium text-[#991b1b] mt-1">{needsReviewCount}</p>
        </div>
        <div className="rounded-[8px] border border-[#fde68a] bg-[#fffbeb] px-[14px] py-[12px]">
          <p className="text-[11px] text-[#92400e]/80">Missing data</p>
          <p className="text-[22px] font-medium text-[#92400e] mt-1">{missingDataCount}</p>
        </div>
        <div className="rounded-[8px] border border-[#86efac] bg-[#f0fdf4] px-[14px] py-[12px]">
          <p className="text-[11px] text-[#166534]/80">Normal</p>
          <p className="text-[22px] font-medium text-[#166534] mt-1">{normalCount}</p>
        </div>
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
          {filter === 'all' ? (
            <>
              {groupedRows.needsAttention.length > 0 ? (
                <section className="space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-zinc-500 dark:text-white/50">Needs attention</p>
                  {groupedRows.needsAttention.map((row) => renderVehicleCard(row))}
                </section>
              ) : null}

              {groupedRows.missing.length > 0 ? (
                <section className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-zinc-500 dark:text-white/50">Missing data</p>
                    <button
                      type="button"
                      onClick={selectAllMissing}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Select all {groupedRows.missing.length}
                    </button>
                  </div>
                  {groupedRows.missing.map((row) =>
                    renderVehicleCard(row, {
                      showMissingCheckbox: true,
                      compactMissing: missingCompact,
                    })
                  )}
                </section>
              ) : null}

              {groupedRows.normal.length > 0 ? (
                <section className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-zinc-500 dark:text-white/50">Normal</p>
                    <button
                      type="button"
                      onClick={() => setShowNormalSection((v) => !v)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      {showNormalSection
                        ? 'Collapse'
                        : `${groupedRows.normal.length} vehicles · all normal`}
                    </button>
                  </div>
                  {showNormalSection ? groupedRows.normal.map((row) => renderVehicleCard(row)) : null}
                </section>
              ) : null}
            </>
          ) : (
            visibleRows.map((row) => renderVehicleCard(row))
          )}
          {filteredRows.length > visibleRows.length ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-slate-400/40 dark:bg-slate-800/50 dark:text-slate-100 dark:hover:bg-slate-700/60"
              >
                Load more ({filteredRows.length - visibleRows.length} remaining)
              </button>
            </div>
          ) : null}
        </div>
      )}

      {selectedMissingCount > 0 ? (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-zinc-300 bg-white/95 backdrop-blur px-4 py-3 shadow-lg dark:border-slate-600 dark:bg-zinc-900/95">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-800 dark:text-white">{selectedMissingCount} vehicles selected</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedMissingIds([])}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Mark as reviewed
              </button>
              <button
                type="button"
                onClick={exportSelectedMissing}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Export list
              </button>
              <button
                type="button"
                onClick={() => setSelectedMissingIds([])}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
