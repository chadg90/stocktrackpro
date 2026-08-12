'use client';

import React, { useMemo, useState } from 'react';
import { useFleetReport } from '../FleetReportContext';
import { buildMileageAttentionRows } from '@/lib/fleetReportLogic';

type PageTab = 'review' | 'readings';
type FlagFilter = 'all' | 'flagged';

function isFlagged(flag: string) {
  return flag === 'Yes' || flag === 'Review';
}

function flagLabel(flag: string, detail: string) {
  if (flag === 'Review') return 'Missing';
  if (flag === 'Yes' && detail.toLowerCase().includes('dropped')) return 'Rollback';
  if (flag === 'Yes') return 'High daily';
  return 'OK';
}

function formatInspected(value: string) {
  if (!value || value === '—') return '—';
  const parsed = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMiles(value: string | number | null) {
  if (value == null || value === '—' || value === '') return '';
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString('en-GB');
}

function formatDelta(value: string) {
  if (!value || value === '—') return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  const formatted = n.toLocaleString('en-GB');
  if (n > 0) return `+${formatted}`;
  return formatted;
}

function displayRegistration(reg: string) {
  if (!reg || reg === '—') return 'No registration';
  const looksLikeId = reg.length >= 18 && !/\s/.test(reg) && /[a-z]/.test(reg) && /[A-Z]/.test(reg);
  return looksLikeId ? 'No registration' : reg;
}

export default function FleetReportMileagePage() {
  const { loading, mileageRows, inspections, vehicles } = useFleetReport();
  const [tab, setTab] = useState<PageTab>('review');
  const [filter, setFilter] = useState<FlagFilter>('all');
  const [vehicleFilter, setVehicleFilter] = useState<{ vehicleId: string; registration: string } | null>(
    null
  );

  const attentionRows = useMemo(
    () => buildMileageAttentionRows(inspections, vehicles),
    [inspections, vehicles]
  );

  const flaggedCount = useMemo(
    () => mileageRows.filter((row) => isFlagged(row['Anomaly Flag'])).length,
    [mileageRows]
  );

  const visibleRows = useMemo(() => {
    let rows = mileageRows;
    if (vehicleFilter) {
      rows = rows.filter(
        (row) =>
          row.Registration === vehicleFilter.registration || row.Registration === vehicleFilter.vehicleId
      );
    }
    if (filter === 'flagged') {
      rows = rows.filter((row) => isFlagged(row['Anomaly Flag']));
    }
    return rows.slice(0, 400);
  }, [mileageRows, filter, vehicleFilter]);

  const openReadingsForVehicle = (vehicleId: string, registration: string) => {
    setVehicleFilter({ vehicleId, registration });
    setFilter('all');
    setTab('readings');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/5"
          role="tablist"
          aria-label="Mileage view"
        >
          {([
            { id: 'review', label: `To review (${attentionRows.length})` },
            { id: 'readings', label: 'Readings' },
          ] as const).map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={tab === option.id}
              onClick={() => setTab(option.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                tab === option.id
                  ? 'bg-blue-600 text-white keep-light-on-dark dark:bg-blue-500'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {tab === 'readings' && (
          <div className="flex flex-wrap items-center gap-3">
            {vehicleFilter && (
              <button
                type="button"
                onClick={() => setVehicleFilter(null)}
                className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-400"
              >
                All vehicles
              </button>
            )}
            <div
              className="inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/5"
              role="tablist"
              aria-label="Mileage row filter"
            >
              {([
                { id: 'all', label: 'All' },
                { id: 'flagged', label: 'Needs review' },
              ] as const).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === option.id}
                  onClick={() => setFilter(option.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    filter === option.id
                      ? 'bg-blue-600 text-white keep-light-on-dark dark:bg-blue-500'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && inspections.length === 0 ? (
        <p className="text-zinc-600 dark:text-white/60 text-sm">Loading…</p>
      ) : tab === 'review' ? (
        <div className="dashboard-card overflow-x-auto">
          {attentionRows.length === 0 ? (
            <p className="text-zinc-600 dark:text-white/60 text-sm p-6">
              No vehicles need a look. Odometer drops, missing miles, a quiet week with no check,
              or a week well above that van’s usual miles will show here.
            </p>
          ) : (
            <table className="w-full text-sm text-left min-w-[720px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/55">
                  <th className="px-3 py-2 font-medium">Vehicle</th>
                  <th className="px-3 py-2 font-medium">Why</th>
                  <th className="px-3 py-2 font-medium">Last check</th>
                  <th className="px-3 py-2 font-medium">Miles</th>
                  <th className="px-3 py-2 font-medium">What to do</th>
                </tr>
              </thead>
              <tbody>
                {attentionRows.map((row) => (
                  <tr
                    key={row.vehicleId}
                    className="border-b border-zinc-100 dark:border-white/5"
                  >
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => openReadingsForVehicle(row.vehicleId, row.registration)}
                        className="font-medium text-blue-700 hover:underline dark:text-blue-400"
                      >
                        {displayRegistration(row.registration)}
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                        {row.reasonLabel}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-zinc-700 dark:text-white/80 whitespace-nowrap">
                      {formatInspected(row.latestInspectionAt)}
                    </td>
                    <td className="px-3 py-2 text-zinc-900 dark:text-white tabular-nums">
                      {formatMiles(row.latestMileage)}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-white/60 max-w-sm">
                      {row.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <div className="px-3 py-2 text-xs text-zinc-500 dark:text-white/50 border-b border-zinc-200 dark:border-white/10">
            {vehicleFilter
              ? `Readings for ${displayRegistration(vehicleFilter.registration)}`
              : `${mileageRows.length} inspections · ${flaggedCount} data flags`}
          </div>
          <table className="w-full text-sm text-left min-w-[920px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/55">
                <th className="px-3 py-2 font-medium">Registration</th>
                <th className="px-3 py-2 font-medium">Inspected</th>
                <th className="px-3 py-2 font-medium">Miles</th>
                <th className="px-3 py-2 font-medium">Previous</th>
                <th className="px-3 py-2 font-medium">Change</th>
                <th className="px-3 py-2 font-medium">Days</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Why</th>
                <th className="px-3 py-2 font-medium">Inspector</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const flagged = isFlagged(row['Anomaly Flag']);
                const status = flagLabel(row['Anomaly Flag'], row['Anomaly Detail']);
                const why = row['Anomaly Detail'] === '—' ? '' : row['Anomaly Detail'];
                const registration = displayRegistration(row.Registration);
                return (
                  <tr
                    key={row['Inspection ID']}
                    className={`border-b border-zinc-100 dark:border-white/5 ${flagged ? 'bg-amber-50 dark:bg-amber-500/5' : ''}`}
                  >
                    <td className="px-3 py-1.5 text-zinc-900 dark:text-white font-medium whitespace-nowrap">
                      {registration}
                    </td>
                    <td className="px-3 py-1.5 text-zinc-700 dark:text-white/80 whitespace-nowrap">
                      {formatInspected(row['Inspected At'])}
                    </td>
                    <td className="px-3 py-1.5 text-zinc-900 dark:text-white tabular-nums">
                      {formatMiles(row.Mileage)}
                    </td>
                    <td className="px-3 py-1.5 text-zinc-600 dark:text-white/70 tabular-nums">
                      {formatMiles(row['Previous Mileage'])}
                    </td>
                    <td className="px-3 py-1.5 text-zinc-900 dark:text-white tabular-nums">
                      {formatDelta(row['Delta Miles'])}
                    </td>
                    <td className="px-3 py-1.5 text-zinc-600 dark:text-white/70 tabular-nums">
                      {row['Days Since Prev'] === '—' ? '' : row['Days Since Prev']}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {flagged ? (
                        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                          {status}
                        </span>
                      ) : (
                        <span className="text-zinc-400 dark:text-white/40 text-xs">OK</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-zinc-600 dark:text-white/60 max-w-[200px]">
                      {why ? (
                        <span className="block truncate" title={why}>
                          {why}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-1.5 text-zinc-700 dark:text-white/70 whitespace-nowrap">
                      {row.Inspector}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filter === 'all' && !vehicleFilter && mileageRows.length > 400 && (
            <p className="text-zinc-500 dark:text-white/50 text-xs px-3 py-2 border-t border-zinc-200 dark:border-white/10">
              Showing the 400 most recent inspections — full history is in the Excel export on Overview.
            </p>
          )}
          {visibleRows.length === 0 && (
            <p className="text-zinc-600 dark:text-white/60 text-sm p-6">
              {filter === 'flagged'
                ? 'No mileage flags in the loaded period.'
                : 'No inspections in the loaded period.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
