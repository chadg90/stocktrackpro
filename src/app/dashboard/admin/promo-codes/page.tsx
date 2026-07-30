'use client';

import React, { useEffect, useState } from 'react';
import {
  collection, query, getDocs, setDoc, deleteDoc, doc,
  updateDoc, serverTimestamp, Timestamp, getDoc, limit,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react';
import Modal from '../../components/Modal';
import { EmptyStateTableRow } from '../../components/EmptyState';
import TableSkeleton from '../../components/TableSkeleton';

type PromoCode = {
  id: string;
  code: string;
  description?: string;
  discountPercent?: number;
  durationDays?: number;
  tier?: string;
  plan?: string;
  subscription_tier?: string;
  schemaVersion?: number;
  vehicleLimit?: number;
  maxUses?: number;
  usedCount?: number;
  used?: boolean;
  expiresAt?: Timestamp | string | null;
  active: boolean;
  createdAt?: Timestamp | string;
};

const PROMO_SCHEMA_VERSION = 2;
const PROMO_VEHICLE_LIMIT = 10;

const isSchemaV2Promo = (code: PromoCode) =>
  code.schemaVersion === PROMO_SCHEMA_VERSION &&
  code.vehicleLimit === PROMO_VEHICLE_LIMIT &&
  !Object.prototype.hasOwnProperty.call(code, 'tier') &&
  !Object.prototype.hasOwnProperty.call(code, 'plan') &&
  !Object.prototype.hasOwnProperty.call(code, 'subscription_tier');

const formatDate = (value?: Timestamp | string | null) => {
  if (!value) return 'No expiry';
  try {
    if (value instanceof Timestamp) return value.toDate().toLocaleDateString('en-GB');
    return new Date(value).toLocaleDateString('en-GB');
  } catch { return '—'; }
};

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formDurationDays, setFormDurationDays] = useState('30');
  const [formMaxUses, setFormMaxUses] = useState('');
  const [formExpires, setFormExpires] = useState('');

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) { setLoading(false); return; }
      const snap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
      if (snap.exists() && snap.data().role === 'admin') {
        setIsAdmin(true);
        fetchCodes();
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchCodes = async () => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      // Cap reads at 500 docs (no orderBy — legacy codes may lack createdAt and
      // orderBy would silently drop them). Sort client-side as before.
      const snap = await getDocs(query(collection(firebaseDb, 'promoCodes'), limit(500)));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PromoCode));
      data.sort((a, b) => {
        const at = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
        const bt = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
        return bt - at;
      });
      setCodes(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !formCode.trim()) return;
    const codeId = formCode.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{0,63}$/.test(codeId)) {
      alert('Code may contain only letters, numbers, hyphens, and underscores.');
      return;
    }
    const durationDays = Number(formDurationDays);
    if (!Number.isFinite(durationDays) || durationDays <= 0) {
      alert('Duration days must be a positive number.');
      return;
    }
    const maxUses = formMaxUses ? Number(formMaxUses) : null;
    if (maxUses != null && (!Number.isInteger(maxUses) || maxUses <= 0)) {
      alert('Max uses must be a positive whole number.');
      return;
    }
    setProcessing(true);
    try {
      // Document ID must equal the code so redeemPromoCode can look it up without client reads.
      await setDoc(doc(firebaseDb, 'promoCodes', codeId), {
        code: codeId,
        description: formDescription.trim() || null,
        discountPercent: formDiscount ? Number(formDiscount) : null,
        durationDays,
        schemaVersion: PROMO_SCHEMA_VERSION,
        vehicleLimit: PROMO_VEHICLE_LIMIT,
        maxUses,
        usedCount: 0,
        used: false,
        expiresAt: formExpires ? new Date(formExpires) : null,
        active: true,
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setFormCode(''); setFormDescription(''); setFormDiscount(''); setFormDurationDays('30'); setFormMaxUses(''); setFormExpires('');
      fetchCodes();
    } catch (e) { alert('Failed to create promo code.'); console.error(e); }
    finally { setProcessing(false); }
  };

  const handleToggle = async (code: PromoCode) => {
    if (!firebaseDb) return;
    if (!isSchemaV2Promo(code) && !code.active) {
      alert('Legacy-schema promo codes cannot be reactivated. Create a schema-v2 code instead.');
      return;
    }
    try {
      await updateDoc(doc(firebaseDb, 'promoCodes', code.id), { active: !code.active });
      fetchCodes();
    } catch { alert('Failed to update code.'); }
  };

  const handleDelete = async (code: PromoCode) => {
    if (!firebaseDb) return;
    if (!confirm(`Delete promo code "${code.code}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(firebaseDb, 'promoCodes', code.id));
      fetchCodes();
    } catch { alert('Failed to delete code.'); }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isAdmin && !loading) {
    return <p className="text-white/60 p-6">Access denied.</p>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Promo Codes</h1>
          <p className="text-white/60 text-sm mt-1">Create and manage discount codes for new subscribers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          New Promo Code
        </button>
      </div>

      <div className="bg-black border border-blue-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-blue-500/20 text-white/60 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Access</th>
                <th className="px-6 py-4 font-medium">Uses</th>
                <th className="px-6 py-4 font-medium">Expires</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <TableSkeleton cols={7} />
              ) : codes.length === 0 ? (
                <EmptyStateTableRow colSpan={7} message="No promo codes created yet." />
              ) : (
                codes.map((code) => (
                  <tr key={code.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-semibold text-sm">{code.code}</span>
                        <button
                          onClick={() => copyCode(code.code)}
                          className="p-1 text-white/40 hover:text-blue-400 transition-colors"
                          title="Copy code"
                        >
                          {copied === code.code ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">{code.description || '—'}</td>
                    <td className="px-6 py-4 text-white/80 text-sm">
                      {isSchemaV2Promo(code) ? 'Up to 10 vehicles' : 'Legacy schema'}
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {code.usedCount ?? 0}{code.maxUses ? ` / ${code.maxUses}` : ''}
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">{formatDate(code.expiresAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        !isSchemaV2Promo(code)
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : code.active
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-white/10 text-white/40 border border-white/20'
                      }`}>
                        {!isSchemaV2Promo(code)
                          ? 'Legacy schema — non-redeemable'
                          : code.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(code)}
                          disabled={!isSchemaV2Promo(code) && !code.active}
                          className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title={!isSchemaV2Promo(code)
                            ? code.active ? 'Deactivate legacy code' : 'Legacy codes cannot be reactivated'
                            : code.active ? 'Deactivate' : 'Activate'}
                        >
                          {code.active ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(code)}
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Promo Code">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-blue-100">Includes access for up to 10 vehicles</p>
            <p className="mt-1 text-xs text-blue-100/70">This fixed limit cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Code <span className="text-red-400">*</span></label>
            <input type="text" value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white font-mono uppercase focus:border-blue-500 outline-none"
              placeholder="e.g. LAUNCH50" required />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Description</label>
            <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="e.g. Launch discount for early adopters" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Access duration (days) <span className="text-red-400">*</span></label>
              <input type="number" min="1" max="3660" value={formDurationDays} onChange={(e) => setFormDurationDays(e.target.value)}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                placeholder="30" required />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Max Uses</label>
              <input type="number" min="1" value={formMaxUses} onChange={(e) => setFormMaxUses(e.target.value)}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                placeholder="Unlimited" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Discount % (optional / informational)</label>
            <input type="number" min="1" max="100" value={formDiscount} onChange={(e) => setFormDiscount(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="Not used for access redemption" />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Expiry Date</label>
            <input type="date" value={formExpires} onChange={(e) => setFormExpires(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40">
              Cancel
            </button>
            <button type="submit" disabled={processing}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60">
              {processing ? 'Creating...' : 'Create Code'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
