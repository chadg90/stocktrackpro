'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { HardDrive, PoundSterling, TrendingUp, Wallet } from 'lucide-react';
import { firebaseDb } from '@/lib/firebase';
import TableSkeleton from '../../components/TableSkeleton';

const STORAGE_INCLUDED_GB = 5;

type UsageSnapshot = {
  monthCostGbp?: number;
  storageBytes?: number;
  firestoreReadsToday?: number;
  firestoreWritesToday?: number;
  warnBudgetGbp?: number;
  killBudgetGbp?: number;
  currency?: string;
  date?: string;
  updatedAt?: Timestamp | null;
};

type DayRow = {
  id: string;
  date: string;
  monthCostGbp: number;
  storageBytes: number | null;
};

function formatGbp(amount?: number | null): string {
  if (amount == null || !Number.isFinite(amount)) return '£—';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatGb(bytes?: number | null): string {
  if (bytes == null || !Number.isFinite(bytes)) return '—';
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toLocaleString('en-GB', { maximumFractionDigits: 2 })} GB`;
}

function formatWhen(ts?: Timestamp | null): string {
  if (!ts) return 'Waiting for first snapshot';
  try {
    return ts.toDate().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Waiting for first snapshot';
  }
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(100, value);
}

/** Full-month estimate from month-to-date spend and days elapsed. */
function projectedMonthCostGbp(monthCost: number, dateStr?: string): number | null {
  if (!Number.isFinite(monthCost)) return null;
  const parts = String(dateStr || '').split('-').map(Number);
  const hasDate = parts.length === 3 && parts.every((n) => Number.isFinite(n) && n > 0);
  const now = new Date();
  const year = hasDate ? parts[0] : now.getFullYear();
  const month = hasDate ? parts[1] : now.getMonth() + 1;
  const day = hasDate ? parts[2] : now.getDate();
  const daysInMonth = new Date(year, month, 0).getDate();
  const elapsed = Math.max(1, Math.min(day, daysInMonth));
  return (monthCost / elapsed) * daysInMonth;
}

function ProgressBar({
  percent,
  tone,
}: {
  percent: number;
  tone: 'blue' | 'amber' | 'red' | 'emerald';
}) {
  const width = clampPercent(percent);
  const color =
    tone === 'red'
      ? 'bg-red-500'
      : tone === 'amber'
        ? 'bg-amber-500'
        : tone === 'emerald'
          ? 'bg-emerald-500'
          : 'bg-blue-500';
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export default function BillingAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<UsageSnapshot | null>(null);
  const [days, setDays] = useState<DayRow[]>([]);

  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      setError('Firebase is not configured.');
      return;
    }

    let cancelled = false;
    const unsub = onSnapshot(
      doc(firebaseDb, 'billing_usage', 'current'),
      (snap) => {
        if (cancelled) return;
        setCurrent(snap.exists() ? (snap.data() as UsageSnapshot) : null);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        if (cancelled) return;
        setError('Could not load billing usage. Confirm you are signed in as admin.');
        setLoading(false);
      }
    );

    (async () => {
      try {
        const daysSnap = await getDocs(
          query(collection(firebaseDb!, 'billing_usage_daily'), orderBy('date', 'desc'), limit(31))
        );
        const dayRows: DayRow[] = [];
        daysSnap.forEach((d) => {
          const data = d.data() as UsageSnapshot;
          dayRows.push({
            id: d.id,
            date: String(data.date || d.id),
            monthCostGbp: Number(data.monthCostGbp) || 0,
            storageBytes: Number.isFinite(Number(data.storageBytes)) ? Number(data.storageBytes) : null,
          });
        });
        if (!cancelled) setDays(dayRows);
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const monthCost = Number(current?.monthCostGbp);
  const projectedCost = projectedMonthCostGbp(
    Number.isFinite(monthCost) ? monthCost : NaN,
    current?.date
  );
  const warnBudget = Number(current?.warnBudgetGbp) || 20;
  const killBudget = Number(current?.killBudgetGbp) || 100;
  const storageBytes = Number(current?.storageBytes);
  const storageGb = Number.isFinite(storageBytes) ? storageBytes / (1024 * 1024 * 1024) : null;
  const warnPct = Number.isFinite(monthCost) ? (monthCost / warnBudget) * 100 : 0;
  const killPct = Number.isFinite(monthCost) ? (monthCost / killBudget) * 100 : 0;
  const storagePct = storageGb != null ? (storageGb / STORAGE_INCLUDED_GB) * 100 : 0;

  const chartDays = useMemo(() => {
    const chronological = [...days].sort((a, b) => a.date.localeCompare(b.date));
    return chronological.map((row, index) => {
      const previous = chronological[index - 1];
      const sameMonth = previous && previous.date.slice(0, 7) === row.date.slice(0, 7);
      const increment =
        sameMonth && row.monthCostGbp >= previous.monthCostGbp
          ? row.monthCostGbp - previous.monthCostGbp
          : row.monthCostGbp;
      return {
        ...row,
        dayCostGbp: Math.max(0, increment),
      };
    });
  }, [days]);

  const maxDayCost = useMemo(
    () => Math.max(0.5, ...chartDays.map((d) => d.dayCostGbp), Number.isFinite(monthCost) ? monthCost : 0),
    [chartDays, monthCost]
  );

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={8} cols={4} standalone />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & storage</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Month-to-date Google Cloud spend in GBP, a projected full-month total, plus Cloud Storage
          use. Spend updates from billing alerts (about every 20 minutes). Storage refreshes hourly.
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Last updated: {formatWhen(current?.updatedAt || null)}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <PoundSterling className="h-4 w-4 text-blue-500" />
            This month
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatGbp(Number.isFinite(monthCost) ? monthCost : null)}
          </div>
          <p className="mt-1 text-xs text-gray-500">Month-to-date</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <TrendingUp className="h-4 w-4 text-violet-500" />
            Projected month
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatGbp(projectedCost)}
          </div>
          <p className="mt-1 text-xs text-gray-500">If this pace continues</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Wallet className="h-4 w-4 text-amber-500" />
            Of £{warnBudget.toFixed(0)} warning
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {clampPercent(warnPct).toFixed(0)}%
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <HardDrive className="h-4 w-4 text-emerald-500" />
            Storage used
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatGb(Number.isFinite(storageBytes) ? storageBytes : null)}
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">How close to the ceiling</h2>
        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-200">Warning budget £{warnBudget.toFixed(0)}</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatGbp(Number.isFinite(monthCost) ? monthCost : null)} / {formatGbp(warnBudget)}
              </span>
            </div>
            <ProgressBar percent={warnPct} tone={warnPct >= 90 ? 'red' : warnPct >= 50 ? 'amber' : 'blue'} />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-200">Kill switch £{killBudget.toFixed(0)}</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatGbp(Number.isFinite(monthCost) ? monthCost : null)} / {formatGbp(killBudget)}
              </span>
            </div>
            <ProgressBar percent={killPct} tone={killPct >= 80 ? 'red' : 'amber'} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Daily amounts</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Bars are that day’s added spend. Month-to-date is on the left; projected month is on the
              right.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Projected</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatGbp(projectedCost)}
            </div>
            <div className="text-xs text-gray-500">MTD {formatGbp(Number.isFinite(monthCost) ? monthCost : null)}</div>
          </div>
        </div>
        {chartDays.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">
            Waiting for the first billing snapshot. Google usually sends one within about 20 minutes of
            spend, then daily rows will fill this chart.
          </p>
        ) : (
          <div className="mt-6 flex h-48 items-end gap-1 sm:gap-2">
            {chartDays.map((row) => {
              const height = Math.max(6, (row.dayCostGbp / maxDayCost) * 100);
              return (
                <div key={row.id} className="flex min-w-0 flex-1 flex-col items-center justify-end">
                  <div className="mb-1 hidden text-[10px] font-semibold text-gray-600 dark:text-gray-300 sm:block">
                    {formatGbp(row.dayCostGbp)}
                  </div>
                  <div
                    className="w-full rounded-t-md bg-blue-500/80 dark:bg-blue-400/80"
                    style={{ height: `${height}%` }}
                    title={`${row.date}: ${formatGbp(row.dayCostGbp)} (MTD ${formatGbp(row.monthCostGbp)})`}
                  />
                  <div className="mt-1 text-[10px] text-gray-500">
                    {row.date.slice(8)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Storage</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Cloud Storage used across buckets, shown against the usual {STORAGE_INCLUDED_GB} GB included
          amount.
        </p>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-200">
              {formatGb(Number.isFinite(storageBytes) ? storageBytes : null)}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {STORAGE_INCLUDED_GB} GB included
            </span>
          </div>
          <ProgressBar
            percent={storagePct}
            tone={storagePct >= 90 ? 'red' : storagePct >= 70 ? 'amber' : 'emerald'}
          />
        </div>
        {(Number.isFinite(Number(current?.firestoreReadsToday)) ||
          Number.isFinite(Number(current?.firestoreWritesToday))) && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Firestore today:{' '}
            {Number(current?.firestoreReadsToday || 0).toLocaleString('en-GB')} reads,{' '}
            {Number(current?.firestoreWritesToday || 0).toLocaleString('en-GB')} writes.
          </p>
        )}
      </section>
    </div>
  );
}
