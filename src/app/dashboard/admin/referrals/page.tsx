'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  limit,
  query,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Plus, RefreshCw } from 'lucide-react';
import Modal from '../../components/Modal';
import TableSkeleton from '../../components/TableSkeleton';
import { EmptyStateTableRow } from '../../components/EmptyState';
import { formatAdminDateTime } from '@/lib/adminDateFormat';
import {
  REFERRAL_COMMISSION_MONTHS,
  REFERRAL_COMMISSION_PERCENT,
  REFERRAL_CONFIRM_AFTER_PAID_MONTHS,
  REFERRAL_PAY_DAY,
  isReferralCodeFormatValid,
  normalizeReferralCode,
} from '@/lib/referralCode';
import { buildReferralCashWorkings, monthKey, type ReferralPayment } from '@/lib/referralCash';

type ReferralDoc = {
  id: string;
  code?: string;
  status?: string;
  referrerId?: string | null;
  companyName?: string | null;
  ownerUid?: string | null;
  capturedAt?: Timestamp | string | null;
  confirmedAt?: Timestamp | string | null;
  payments?: ReferralPayment[];
  paidMonthsCount?: number;
  stopReason?: string;
};

type CodeDoc = {
  id: string;
  code?: string;
  referrerId?: string;
  referrerLabel?: string | null;
  active?: boolean;
};

type CompanyLite = {
  id: string;
  name?: string;
  subscription_status?: string;
  subscribed_vehicles?: number;
  billing_cycle?: string;
  /** Actual monthly amount charged (loyalty / custom); annual firms store monthly equivalent or use billing_cycle. */
  monthly_amount_gbp?: number;
};

type ProfileOption = {
  uid: string;
  label: string;
  name: string;
};

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

export default function AdminReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<ReferralDoc[]>([]);
  const [codes, setCodes] = useState<CodeDoc[]>([]);
  const [companies, setCompanies] = useState<Record<string, CompanyLite>>({});
  const [referrerLabels, setReferrerLabels] = useState<Record<string, string>>({});
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processing, setProcessing] = useState(false);

  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formReferrerId, setFormReferrerId] = useState('');
  const [formReferrerLabel, setFormReferrerLabel] = useState('');

  const [matchTarget, setMatchTarget] = useState<ReferralDoc | null>(null);
  const [matchReferrerId, setMatchReferrerId] = useState('');

  const [payTarget, setPayTarget] = useState<ReferralDoc | null>(null);
  const [payMonth, setPayMonth] = useState(() => monthKey(new Date()));
  const [payAmount, setPayAmount] = useState('');

  const load = useCallback(async () => {
    if (!firebaseDb) return;
    setLoading(true);
    setError(null);
    try {
      const [refSnap, codeSnap, companySnap, profilesSnap] = await Promise.all([
        getDocs(query(collection(firebaseDb!, 'referrals'), limit(500))),
        getDocs(query(collection(firebaseDb!, 'referralCodes'), limit(200))),
        getDocs(query(collection(firebaseDb!, 'companies'), limit(500))),
        getDocs(query(collection(firebaseDb!, 'profiles'), limit(500))),
      ]);

      const referralRows: ReferralDoc[] = refSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ReferralDoc, 'id'>),
      }));
      referralRows.sort((a, b) => {
        const at = toDate(a.capturedAt)?.getTime() ?? 0;
        const bt = toDate(b.capturedAt)?.getTime() ?? 0;
        return bt - at;
      });

      const codeRows: CodeDoc[] = codeSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CodeDoc, 'id'>),
      }));

      const companyMap: Record<string, CompanyLite> = {};
      companySnap.docs.forEach((d) => {
        companyMap[d.id] = { id: d.id, ...(d.data() as Omit<CompanyLite, 'id'>) };
      });

      const labels: Record<string, string> = {};
      const options: ProfileOption[] = profilesSnap.docs.map((d) => {
        const p = d.data();
        const name =
          `${p.first_name || ''} ${p.last_name || ''}`.trim() ||
          p.display_name ||
          p.email ||
          d.id.slice(0, 8);
        const companyName =
          (typeof p.company_id === 'string' && companyMap[p.company_id]?.name) || '';
        const email = typeof p.email === 'string' ? p.email : '';
        const label = [name, email && email !== name ? email : '', companyName]
          .filter(Boolean)
          .join(' — ');
        labels[d.id] = name;
        return { uid: d.id, label, name };
      });
      options.sort((a, b) => a.label.localeCompare(b.label, 'en-GB'));

      setReferrals(referralRows);
      setCodes(codeRows);
      setCompanies(companyMap);
      setReferrerLabels(labels);
      setProfileOptions(options);
    } catch (err) {
      console.error(err);
      setError('Could not load referrals. Check Firestore rules are deployed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!firebaseAuth) return;
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) void load();
      else setLoading(false);
    });
    return () => unsub();
  }, [load]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return referrals;
    return referrals.filter((r) => (r.status || 'pending') === statusFilter);
  }, [referrals, statusFilter]);

  const totals = useMemo(() => {
    const byStatus: Record<string, number> = {};
    let owedThisMonth = 0;
    for (const r of referrals) {
      const s = r.status || 'pending';
      byStatus[s] = (byStatus[s] || 0) + 1;
      const company = companies[r.id];
      const cash = buildReferralCashWorkings({
        status: r.status,
        payments: r.payments,
        monthlyAmountGbp: company?.monthly_amount_gbp,
        subscribedVehicles: company?.subscribed_vehicles,
        billingCycle: company?.billing_cycle,
        confirmedAt: toDate(r.confirmedAt),
      });
      if ((s === 'active' || s === 'confirmed') && cash.estimatedMonthlyGbp != null) {
        owedThisMonth += cash.estimatedMonthlyGbp;
      }
    }
    return { byStatus, owedThisMonth };
  }, [referrals, companies]);

  const authHeaders = async () => {
    const user = firebaseAuth?.currentUser;
    if (!user) throw new Error('Not signed in');
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const runUpdate = async (companyId: string, action: string, extra: Record<string, unknown> = {}) => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/referrals/update', {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ companyId, action, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Update failed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      const code = normalizeReferralCode(formCode);
      if (!isReferralCodeFormatValid(code) || code.length < 3) {
        throw new Error('Code must be 3–20 characters: letters, numbers, or hyphens');
      }
      const res = await fetch('/api/admin/referrals/codes', {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({
          code,
          referrerId: formReferrerId.trim(),
          referrerLabel: formReferrerLabel.trim() || undefined,
          active: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save code');
      setCodeModalOpen(false);
      setFormCode('');
      setFormReferrerId('');
      setFormReferrerLabel('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save code');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTarget) return;
    const amount = payAmount.trim() ? Number(payAmount) : undefined;
    await runUpdate(payTarget.id, 'mark_paid', {
      month: payMonth,
      amountGbp: amount,
    });
    setPayTarget(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Referrals</h1>
          <p className="text-white/60 text-sm mt-1 max-w-2xl">
            Invite-only scheme: {REFERRAL_COMMISSION_PERCENT}% for {REFERRAL_COMMISSION_MONTHS} months,
            paid on the {REFERRAL_PAY_DAY}th, confirmed after {REFERRAL_CONFIRM_AFTER_PAID_MONTHS} paid
            months. Capture is automatic at signup — use this page for cash workings (who to pay, when,
            and when it stops). No Stripe payouts from here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setCodeModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add code
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {['pending', 'unrecognised', 'active', 'completed'].map((s) => (
          <div key={s} className="dashboard-card p-4">
            <p className="text-white/50 text-xs uppercase tracking-wide">{s}</p>
            <p className="text-white text-2xl font-semibold mt-1">{totals.byStatus[s] || 0}</p>
          </div>
        ))}
      </div>
      <div className="dashboard-card p-4">
        <p className="text-white/50 text-xs uppercase tracking-wide">
          Estimated due this cycle (active)
        </p>
        <p className="text-white text-2xl font-semibold mt-1">
          £{totals.owedThisMonth.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-white/45 text-xs mt-1">
          {REFERRAL_COMMISSION_PERCENT}% of what each firm actually pays (after discounts; annual ÷ 12). Adjust when you
          mark paid.
        </p>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Signup captures</h2>
          <label className="text-sm text-white/60 inline-flex items-center gap-2">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="unrecognised">Unrecognised</option>
              <option value="active">Active</option>
              <option value="stopped">Stopped</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Captured</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Referrer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Months paid</th>
                <th className="px-4 py-3">Total paid so far</th>
                <th className="px-4 py-3">Cash workings</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <TableSkeleton cols={9} />
              ) : filtered.length === 0 ? (
                <EmptyStateTableRow colSpan={9} message="No referrals captured yet." />
              ) : (
                filtered.map((row) => {
                  const company = companies[row.id];
                  const cash = buildReferralCashWorkings({
                    status: row.status,
                    payments: row.payments,
                    monthlyAmountGbp: company?.monthly_amount_gbp,
                    subscribedVehicles: company?.subscribed_vehicles,
                    billingCycle: company?.billing_cycle,
                    subscriptionStatus: company?.subscription_status,
                    confirmedAt: toDate(row.confirmedAt),
                  });
                  const referrer =
                    (row.referrerId && referrerLabels[row.referrerId]) ||
                    row.referrerId ||
                    '—';
                  return (
                    <tr key={row.id} className="align-top">
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                        {formatAdminDateTime(row.capturedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">
                          {row.companyName || company?.name || row.id.slice(0, 8)}
                        </p>
                        <p className="text-white/40 text-xs">
                          {company?.subscription_status || '—'}
                          {company?.subscribed_vehicles
                            ? ` · ${company.subscribed_vehicles} slots`
                            : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono text-white">{row.code || '—'}</td>
                      <td className="px-4 py-3 text-white/80">{referrer}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs border border-white/15 text-white/80 capitalize">
                          {row.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/80 whitespace-nowrap">
                        {cash.monthsPaid}/{REFERRAL_COMMISSION_MONTHS}
                      </td>
                      <td className="px-4 py-3 text-white/80 whitespace-nowrap">
                        £{cash.totalPaidGbp.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-white/70 text-xs space-y-1 max-w-xs">
                        <p>{cash.eligibilityNote}</p>
                        <p>
                          Est. / month:{' '}
                          {cash.estimatedMonthlyGbp != null
                            ? `£${cash.estimatedMonthlyGbp.toFixed(2)}`
                            : '—'}
                        </p>
                        {cash.nextPayDate ? <p>Next pay day {cash.nextPayDate}</p> : null}
                        {cash.stopsAfterMonth ? (
                          <p>Stops after commission month {cash.stopsAfterMonth}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex flex-col items-end gap-1">
                          {(row.status === 'pending' || row.status === 'unrecognised') && (
                            <button
                              type="button"
                              disabled={processing || !row.referrerId}
                              onClick={() => void runUpdate(row.id, 'confirm')}
                              className="text-xs text-blue-400 hover:underline disabled:opacity-40"
                              title={!row.referrerId ? 'Set a referrer first' : 'Confirm after 2 paid months'}
                            >
                              Confirm
                            </button>
                          )}
                          {(row.status === 'active' || row.status === 'confirmed') && (
                            <>
                              <button
                                type="button"
                                disabled={processing}
                                onClick={() => {
                                  setPayTarget(row);
                                  const est = cash.estimatedMonthlyGbp;
                                  setPayAmount(est != null ? String(est) : '');
                                  setPayMonth(monthKey(new Date()));
                                }}
                                className="text-xs text-emerald-400 hover:underline disabled:opacity-40"
                              >
                                Mark paid
                              </button>
                              <button
                                type="button"
                                disabled={processing}
                                onClick={() => void runUpdate(row.id, 'stop', { note: 'Stopped by admin' })}
                                className="text-xs text-red-400 hover:underline disabled:opacity-40"
                              >
                                Stop
                              </button>
                            </>
                          )}
                          {row.status === 'stopped' && (
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() => void runUpdate(row.id, 'reactivate')}
                              className="text-xs text-blue-400 hover:underline disabled:opacity-40"
                            >
                              Reactivate
                            </button>
                          )}
                          {row.status === 'unrecognised' && (
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() => {
                                setMatchReferrerId('');
                                setMatchTarget(row);
                              }}
                              className="text-xs text-amber-300 hover:underline disabled:opacity-40"
                            >
                              Match referrer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Referral codes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Referrer</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <TableSkeleton cols={3} />
              ) : codes.length === 0 ? (
                <EmptyStateTableRow colSpan={3} message="No codes yet. Add one to recognise signup codes." />
              ) : (
                codes.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono text-white">{c.code || c.id}</td>
                    <td className="px-4 py-3 text-white/80">
                      {c.referrerLabel ||
                        (c.referrerId && referrerLabels[c.referrerId]) ||
                        c.referrerId ||
                        '—'}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {c.active === false ? 'Inactive' : 'Active'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={codeModalOpen} onClose={() => setCodeModalOpen(false)} title="Add referral code">
        <form onSubmit={handleCreateCode} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Code</label>
            <input
              value={formCode}
              onChange={(e) => setFormCode(normalizeReferralCode(e.target.value))}
              maxLength={20}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white font-mono uppercase"
              placeholder="e.g. CHAD-01"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Referrer</label>
            <select
              value={formReferrerId}
              onChange={(e) => {
                const uid = e.target.value;
                setFormReferrerId(uid);
                const opt = profileOptions.find((p) => p.uid === uid);
                if (opt && !formReferrerLabel.trim()) {
                  setFormReferrerLabel(opt.name);
                }
              }}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white text-sm"
              required
            >
              <option value="">Select a person…</option>
              {profileOptions.map((p) => (
                <option key={p.uid} value={p.uid}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Label (admin only)</label>
            <input
              value={formReferrerLabel}
              onChange={(e) => setFormReferrerLabel(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="Name for your reference — never shown to customers"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCodeModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold disabled:opacity-60"
            >
              {processing ? 'Saving…' : 'Save code'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(matchTarget)}
        onClose={() => setMatchTarget(null)}
        title="Match referrer"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!matchTarget || !matchReferrerId) return;
            void runUpdate(matchTarget.id, 'set_unrecognised_code', {
              referrerId: matchReferrerId,
            }).then(() => setMatchTarget(null));
          }}
          className="space-y-4"
        >
          <p className="text-sm text-white/70">
            Assign who should earn commission for{' '}
            <span className="text-white font-medium">
              {matchTarget?.companyName || matchTarget?.id}
            </span>
            {matchTarget?.code ? (
              <>
                {' '}
                (code <span className="font-mono text-white">{matchTarget.code}</span>)
              </>
            ) : null}
            .
          </p>
          <div>
            <label className="block text-sm text-white/70 mb-1">Referrer</label>
            <select
              value={matchReferrerId}
              onChange={(e) => setMatchReferrerId(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white text-sm"
              required
            >
              <option value="">Select a person…</option>
              {profileOptions.map((p) => (
                <option key={p.uid} value={p.uid}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setMatchTarget(null)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing || !matchReferrerId}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold disabled:opacity-60"
            >
              {processing ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(payTarget)}
        onClose={() => setPayTarget(null)}
        title="Record commission payment"
      >
        <form onSubmit={handleMarkPaid} className="space-y-4">
          <p className="text-sm text-white/70">
            Record what you paid for{' '}
            <span className="text-white font-medium">
              {payTarget?.companyName || payTarget?.id}
            </span>
            . Pay day is the {REFERRAL_PAY_DAY}th.
          </p>
          <div>
            <label className="block text-sm text-white/70 mb-1">Month (YYYY-MM)</label>
            <input
              type="month"
              value={payMonth}
              onChange={(e) => setPayMonth(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Amount (£)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="Optional"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPayTarget(null)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-60"
            >
              {processing ? 'Saving…' : 'Mark paid'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
