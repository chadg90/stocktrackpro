'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import {
  Building2,
  ClipboardList,
  Tag,
  Newspaper,
  BarChart3,
  LineChart,
  Wallet,
  ExternalLink,
  Truck,
  AlertTriangle,
  Hourglass,
  Users,
} from 'lucide-react';
import { GA_ADMIN_URL } from '@/lib/analytics';
import { getTrialEndDate, type TrialCompanyFields } from '@/lib/trialStatus';
import { formatAdminDate } from '@/lib/adminDateFormat';
import {
  countCompanyFleetVehicles,
  isLegacyOnlyCompany,
  isPaidStripeCompany,
  isPromoCompany,
  isTrialCompany,
  type AdminCompanyPlanFields,
} from '@/lib/adminCompanyMetrics';

type CompanyRow = TrialCompanyFields &
  AdminCompanyPlanFields & {
    id: string;
    name?: string;
  };

type AdminHomeStats = {
  paid: number;
  promo: number;
  legacy: number;
  trial: number;
  inactive: number;
  totalVehicles: number;
  retiredVehicles: number;
  mrrGbp: number | null;
  inspectionsLast7Days: number;
  noInspection14Days: Array<{ id: string; name: string; daysSince: number | null }>;
  trialsEnding7Days: Array<{ id: string; name: string; ends: Date }>;
};

const ADMIN_LINKS = [
  { name: 'Companies', href: '/dashboard/admin/companies/', icon: Building2 },
  { name: 'Admin Reports', href: '/dashboard/admin/reports/', icon: BarChart3 },
  { name: 'Product usage', href: '/dashboard/admin/product-usage/', icon: LineChart },
  { name: 'Promo Codes', href: '/dashboard/admin/promo-codes/', icon: Tag },
  { name: 'Referrals', href: '/dashboard/admin/referrals/', icon: Users },
  { name: 'Compliance articles', href: '/dashboard/admin/compliance-articles/', icon: Newspaper },
  { name: 'Billing & storage', href: '/dashboard/admin/billing/', icon: Wallet },
];

function statusBucket(status?: string): 'active' | 'trial' | 'inactive' {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'active';
  if (s === 'trial' || s === 'trialing') return 'trial';
  return 'inactive';
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminHomeStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      setError('Firebase is not configured.');
      return;
    }

    let cancelled = false;
    const waitForUser = () =>
      new Promise<void>((resolve) => {
        if (!firebaseAuth) {
          resolve();
          return;
        }
        if (firebaseAuth.currentUser) {
          resolve();
          return;
        }
        const unsub = onAuthStateChanged(firebaseAuth, () => {
          unsub();
          resolve();
        });
      });

    (async () => {
      setLoading(true);
      setError(null);
      try {
        await waitForUser();
        if (cancelled) return;
        const companiesSnap = await getDocs(collection(firebaseDb!, 'companies'));
        const companies: CompanyRow[] = companiesSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CompanyRow, 'id'>),
        }));

        let paid = 0;
        let promo = 0;
        let legacy = 0;
        let trial = 0;
        let inactive = 0;
        for (const c of companies) {
          // Paid first so Stripe-billed legacy (Newstreet) counts as Paid, not Legacy.
          if (isPaidStripeCompany(c)) paid += 1;
          else if (isLegacyOnlyCompany(c)) legacy += 1;
          else if (isPromoCompany(c)) promo += 1;
          else if (isTrialCompany(c)) trial += 1;
          else inactive += 1;
        }

        let totalVehicles = 0;
        let retiredVehicles = 0;
        const fleetCounts = await Promise.all(
          companies.map((c) => countCompanyFleetVehicles(firebaseDb!, c.id).catch(() => ({ live: 0, retired: 0 })))
        );
        for (const row of fleetCounts) {
          totalVehicles += row.live;
          retiredVehicles += row.retired;
        }

        let mrrGbp: number | null = null;
        try {
          const user = firebaseAuth?.currentUser;
          const token = user ? await user.getIdToken() : null;
          if (token) {
            const res = await fetch('/api/admin/mrr', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && typeof data.mrrGbp === 'number') mrrGbp = data.mrrGbp;
          }
        } catch {
          mrrGbp = null;
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        let inspectionsLast7Days = 0;
        try {
          const inspCount = await getCountFromServer(
            query(
              collection(firebaseDb!, 'vehicle_inspections'),
              where('inspected_at', '>=', Timestamp.fromDate(sevenDaysAgo))
            )
          );
          inspectionsLast7Days = inspCount.data().count;
        } catch {
          // Fallback without composite index: sample recent docs client-side (capped).
          try {
            const recent = await getDocs(
              query(
                collection(firebaseDb!, 'vehicle_inspections'),
                orderBy('inspected_at', 'desc'),
                limit(500)
              )
            );
            inspectionsLast7Days = recent.docs.filter((d) => {
              const dt = toDate(d.data().inspected_at);
              return dt != null && dt >= sevenDaysAgo;
            }).length;
          } catch {
            inspectionsLast7Days = 0;
          }
        }

        const fourteenDaysAgo = Date.now() - 14 * 86400000;
        const noInspection14Days: AdminHomeStats['noInspection14Days'] = [];

        await Promise.all(
          companies.map(async (company) => {
            try {
              const latestSnap = await getDocs(
                query(
                  collection(firebaseDb!, 'vehicle_inspections'),
                  where('company_id', '==', company.id),
                  orderBy('inspected_at', 'desc'),
                  limit(1)
                )
              );
              const latestRaw = latestSnap.docs[0]?.data()?.inspected_at;
              const latest = toDate(latestRaw);
              const daysSince = latest
                ? Math.floor((Date.now() - latest.getTime()) / 86400000)
                : null;
              if (latest == null || latest.getTime() < fourteenDaysAgo) {
                noInspection14Days.push({
                  id: company.id,
                  name: company.name || company.id,
                  daysSince,
                });
              }
            } catch {
              noInspection14Days.push({
                id: company.id,
                name: company.name || company.id,
                daysSince: null,
              });
            }
          })
        );

        noInspection14Days.sort((a, b) => {
          if (a.daysSince == null) return -1;
          if (b.daysSince == null) return 1;
          return b.daysSince - a.daysSince;
        });

        const now = Date.now();
        const inSevenDays = now + 7 * 86400000;
        const trialsEnding7Days = companies
          .filter((c) => statusBucket(c.subscription_status) === 'trial')
          .map((c) => {
            const ends = getTrialEndDate(c);
            return ends ? { id: c.id, name: c.name || c.id, ends } : null;
          })
          .filter((row): row is { id: string; name: string; ends: Date } => {
            if (!row) return false;
            const t = row.ends.getTime();
            return t >= now && t <= inSevenDays;
          })
          .sort((a, b) => a.ends.getTime() - b.ends.getTime());

        if (!cancelled) {
          setStats({
            paid,
            promo,
            legacy,
            trial,
            inactive,
            totalVehicles,
            retiredVehicles,
            mrrGbp,
            inspectionsLast7Days,
            noInspection14Days,
            trialsEnding7Days,
          });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Could not load admin home metrics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin home</h1>
        <p className="text-white/60 text-sm mt-1">
          Platform overview across all companies. Super-admin only.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dashboard-card p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide">Paid</p>
          <p className="text-white text-3xl font-semibold mt-2">
            {loading ? '…' : (stats?.paid ?? 0)}
          </p>
          <p className="text-white/40 text-xs mt-1">Active Stripe subscription</p>
        </div>
        <div className="dashboard-card p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide">Promo</p>
          <p className="text-white text-3xl font-semibold mt-2">
            {loading ? '…' : (stats?.promo ?? 0)}
          </p>
        </div>
        <div className="dashboard-card p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide">Legacy</p>
          <p className="text-white text-3xl font-semibold mt-2">
            {loading ? '…' : (stats?.legacy ?? 0)}
          </p>
        </div>
        <div className="dashboard-card p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide">Trial companies</p>
          <p className="text-white text-3xl font-semibold mt-2">
            {loading ? '…' : (stats?.trial ?? 0)}
          </p>
        </div>
        <div className="dashboard-card p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide">Inactive companies</p>
          <p className="text-white text-3xl font-semibold mt-2">
            {loading ? '…' : (stats?.inactive ?? 0)}
          </p>
        </div>
        <div className="dashboard-card p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide">MRR</p>
          <p className="text-white text-3xl font-semibold mt-2">
            {loading
              ? '…'
              : stats?.mrrGbp == null
                ? '—'
                : stats.mrrGbp.toLocaleString('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="dashboard-card p-5 flex items-start gap-3">
          <Truck className="h-5 w-5 text-blue-400 mt-1 shrink-0" aria-hidden />
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide">Total vehicles</p>
            <p className="text-white text-3xl font-semibold mt-1">
              {loading ? '…' : (stats?.totalVehicles ?? 0).toLocaleString('en-GB')}
            </p>
            <p className="text-white/40 text-xs mt-1">
              Active, non-retired · matches Companies Vehicles column
              {!loading && (stats?.retiredVehicles ?? 0) > 0
                ? ` · ${stats!.retiredVehicles.toLocaleString('en-GB')} retired`
                : ''}
            </p>
          </div>
        </div>
        <div className="dashboard-card p-5 flex items-start gap-3">
          <ClipboardList className="h-5 w-5 text-blue-400 mt-1 shrink-0" aria-hidden />
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide">
              Inspections (last 7 days)
            </p>
            <p className="text-white text-3xl font-semibold mt-1">
              {loading ? '…' : (stats?.inspectionsLast7Days ?? 0).toLocaleString('en-GB')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="dashboard-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
              No inspection in 14 days
            </h2>
          </div>
          {loading ? (
            <p className="text-white/50 text-sm">Loading…</p>
          ) : !stats?.noInspection14Days.length ? (
            <p className="text-white/50 text-sm">All companies have a recent inspection.</p>
          ) : (
            <ul className="space-y-2 max-h-56 overflow-y-auto text-sm">
              {stats.noInspection14Days.map((row) => (
                <li key={row.id} className="flex justify-between gap-2 text-white/80">
                  <span className="truncate">{row.name}</span>
                  <span className="text-white/50 shrink-0">
                    {row.daysSince == null ? 'Never' : `${row.daysSince}d`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Hourglass className="h-4 w-4 text-blue-400" aria-hidden />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
              Trials ending in 7 days
            </h2>
          </div>
          {loading ? (
            <p className="text-white/50 text-sm">Loading…</p>
          ) : !stats?.trialsEnding7Days.length ? (
            <p className="text-white/50 text-sm">No trials ending this week.</p>
          ) : (
            <ul className="space-y-2 max-h-56 overflow-y-auto text-sm">
              {stats.trialsEnding7Days.map((row) => (
                <li key={row.id} className="flex justify-between gap-2 text-white/80">
                  <span className="truncate">{row.name}</span>
                  <span className="text-white/50 shrink-0">{formatAdminDate(row.ends)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="dashboard-card p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
          Admin pages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
            >
              <link.icon className="h-4 w-4 text-white/50 shrink-0" aria-hidden />
              {link.name}
            </Link>
          ))}
          <a
            href={GA_ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-white/50 shrink-0" aria-hidden />
            Website analytics
          </a>
        </div>
      </div>
    </div>
  );
}
