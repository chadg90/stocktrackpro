'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { Activity, BarChart3, EyeOff } from 'lucide-react';
import { firebaseDb } from '@/lib/firebase';
import {
  TRACKED_FEATURES,
  TRACKED_PAGES,
  type UsageKind,
} from '@/lib/productUsage';
import TableSkeleton from '../../components/TableSkeleton';

type TotalRow = {
  id: string;
  key: string;
  kind: UsageKind;
  label?: string;
  count: number;
  last_seen?: Timestamp | null;
};

type DayRow = {
  id: string;
  date: string;
  counts: Record<string, number>;
};

function formatWhen(ts?: Timestamp | null): string {
  if (!ts) return '—';
  try {
    return ts.toDate().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function ProductUsageAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<TotalRow[]>([]);
  const [days, setDays] = useState<DayRow[]>([]);

  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      setError('Firebase is not configured.');
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const totalsSnap = await getDocs(
          query(collection(firebaseDb!, 'product_usage_totals'), orderBy('count', 'desc'), limit(200))
        );
        const totalRows: TotalRow[] = [];
        totalsSnap.forEach((d) => {
          const data = d.data();
          totalRows.push({
            id: d.id,
            key: String(data.key || d.id),
            kind: (data.kind === 'feature_click' ? 'feature_click' : 'page_view') as UsageKind,
            label: typeof data.label === 'string' ? data.label : undefined,
            count: typeof data.count === 'number' ? data.count : Number(data.count) || 0,
            last_seen: (data.last_seen as Timestamp) || null,
          });
        });

        const daysSnap = await getDocs(
          query(collection(firebaseDb!, 'product_usage_daily'), orderBy('date', 'desc'), limit(30))
        );
        const dayRows: DayRow[] = [];
        daysSnap.forEach((d) => {
          const data = d.data();
          const counts =
            data.counts && typeof data.counts === 'object'
              ? (data.counts as Record<string, number>)
              : {};
          dayRows.push({
            id: d.id,
            date: String(data.date || d.id),
            counts,
          });
        });

        if (!cancelled) {
          setTotals(totalRows);
          setDays(dayRows);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(
            'Could not load product usage. Deploy Firestore rules/indexes for product_usage_* if this is the first run.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const pages = useMemo(
    () => totals.filter((t) => t.kind === 'page_view').sort((a, b) => b.count - a.count),
    [totals]
  );
  const features = useMemo(
    () => totals.filter((t) => t.kind === 'feature_click').sort((a, b) => b.count - a.count),
    [totals]
  );

  const unusedPages = useMemo(() => {
    const seen = new Set(pages.map((p) => p.key));
    return TRACKED_PAGES.filter((p) => !seen.has(p.key));
  }, [pages]);

  const unusedFeatures = useMemo(() => {
    const seen = new Set(features.map((f) => f.key));
    return TRACKED_FEATURES.filter((f) => !seen.has(f.key));
  }, [features]);

  const last7EventSum = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return days
      .filter((d) => d.date >= cutoffStr)
      .reduce((sum, d) => sum + Object.values(d.counts || {}).reduce((a, b) => a + (Number(b) || 0), 0), 0);
  }, [days]);

  const topKey = pages[0] || features[0] || null;

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product usage</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          First-party dashboard analytics (no paid tools). Use this to see what managers open most and what is
          unused. Website traffic is in the Vercel Analytics dashboard.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Activity className="h-4 w-4 text-blue-500" />
            Events (7 days)
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{last7EventSum}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Tracked pages with use
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{pages.length}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <EyeOff className="h-4 w-4 text-amber-500" />
            Unused tracked items
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {unusedPages.length + unusedFeatures.length}
          </div>
        </div>
      </div>

      {topKey && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Most used so far:{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {topKey.label || topKey.key}
          </span>{' '}
          ({topKey.count.toLocaleString('en-GB')} hits)
        </p>
      )}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Pages</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-gray-500">
                    No page views recorded yet. Browse the dashboard while signed in as a manager to start
                    collecting.
                  </td>
                </tr>
              ) : (
                pages.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {row.label || row.key}
                      <div className="text-xs text-gray-500">{row.key.replace(/^page:/, '')}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {row.count.toLocaleString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {formatWhen(row.last_seen)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Feature clicks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Feature</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {features.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-gray-500">
                    No feature clicks yet.
                  </td>
                </tr>
              ) : (
                features.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{row.label || row.key}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {row.count.toLocaleString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {formatWhen(row.last_seen)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <h2 className="text-sm font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
          Unused (tracked catalogue)
        </h2>
        <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
          Items below have zero recorded use since tracking started. Good candidates to simplify or remove after
          you have a few weeks of data.
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-amber-950 dark:text-amber-50">
          {[...unusedPages.map((p) => p.label), ...unusedFeatures.map((f) => f.label)].map((label) => (
            <li key={label} className="rounded-lg border border-amber-200/80 bg-white/70 px-3 py-2 dark:border-amber-900 dark:bg-black/20">
              {label}
            </li>
          ))}
          {unusedPages.length + unusedFeatures.length === 0 && (
            <li className="text-amber-900/70 dark:text-amber-100/70">Every tracked item has been used at least once.</li>
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Last 30 days (daily totals)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Events</th>
              </tr>
            </thead>
            <tbody>
              {days.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-gray-500">
                    No daily rows yet.
                  </td>
                </tr>
              ) : (
                days.map((d) => {
                  const total = Object.values(d.counts || {}).reduce((a, b) => a + (Number(b) || 0), 0);
                  return (
                    <tr key={d.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{d.date}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {total.toLocaleString('en-GB')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
