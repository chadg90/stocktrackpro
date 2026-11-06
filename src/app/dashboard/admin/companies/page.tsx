'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  getCountFromServer,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import {
  Pencil,
  Search,
  Building2,
  Users,
  Truck,
  Plus,
  Copy,
  Check,
  ArrowUpDown,
  Info,
} from 'lucide-react';
import Modal from '../../components/Modal';
import TypeToConfirmDelete from '../../components/TypeToConfirmDelete';
import AdminRowMenu from '../../components/AdminRowMenu';
import { formatAdminDate } from '@/lib/adminDateFormat';
import { getTrialEndDate, type TrialCompanyFields } from '@/lib/trialStatus';
import { countCompanyFleetVehicles } from '@/lib/adminCompanyMetrics';

type Company = TrialCompanyFields & {
  id: string;
  name?: string;
  subscription_status?: string;
  subscription_type?: string;
  billing_cycle?: string;
  subscribed_vehicles?: number;
  stripe_subscription_id?: string;
  legacy?: boolean;
  created_at?: unknown;
};

type CompanyWithCounts = Company & {
  vehiclesCount: number;
  usersCount: number;
  lastInspectionAt: Date | null;
};

type StatusFilter = 'all' | 'active' | 'trial' | 'inactive';
type SortKey =
  | 'name'
  | 'vehicles'
  | 'users'
  | 'status'
  | 'plan'
  | 'trialEnds'
  | 'lastInspection'
  | 'created';

function statusBucket(status?: string): 'active' | 'trial' | 'inactive' {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'active';
  if (s === 'trial' || s === 'trialing') return 'trial';
  return 'inactive';
}

function planLabel(company: Company): string {
  if (company.legacy === true) return 'Legacy';
  if (company.subscription_type === 'promotional') return 'Promo';
  if (company.subscription_type === 'stripe' || company.stripe_subscription_id) {
    return company.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly';
  }
  if (statusBucket(company.subscription_status) === 'trial') return 'Trial';
  return company.subscription_type?.trim() || '—';
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

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<CompanyWithCounts | null>(null);
  const [editName, setEditName] = useState('');
  const [editVehicleCount, setEditVehicleCount] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [quantityMessage, setQuantityMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompanyWithCounts | null>(null);

  const fetchCompanies = async () => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      const companiesSnap = await getDocs(query(collection(firebaseDb!, 'companies')));
      const companiesData = companiesSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Company)
      );

      const companiesWithCounts = await Promise.all(
        companiesData.map(async (company) => {
          try {
            const [vehiclesCount, usersCount, lastInspectionAt] = await Promise.all([
              countCompanyFleetVehicles(firebaseDb!, company.id)
                .then((row) => row.live)
                .catch(() => 0),
              getCountFromServer(
                query(collection(firebaseDb!, 'profiles'), where('company_id', '==', company.id))
              )
                .then((snap) => snap.data().count)
                .catch(() => 0),
              getDocs(
                query(
                  collection(firebaseDb!, 'vehicle_inspections'),
                  where('company_id', '==', company.id),
                  orderBy('inspected_at', 'desc'),
                  limit(1)
                )
              )
                .then((snap) => toDate(snap.docs[0]?.data()?.inspected_at))
                .catch(() => null),
            ]);
            return { ...company, vehiclesCount, usersCount, lastInspectionAt };
          } catch {
            return {
              ...company,
              vehiclesCount: 0,
              usersCount: 0,
              lastInspectionAt: null as Date | null,
            };
          }
        })
      );

      setCompanies(companiesWithCounts);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !newCompanyName.trim()) return;

    setProcessing(true);
    try {
      await addDoc(collection(firebaseDb!, 'companies'), {
        name: newCompanyName.trim(),
        subscription_status: 'trial',
        created_at: serverTimestamp(),
      });
      setIsCreateModalOpen(false);
      setNewCompanyName('');
      await fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !firebaseAuth || !currentCompany || !editName.trim()) return;

    setProcessing(true);
    setQuantityMessage(null);
    try {
      const companyRef = doc(firebaseDb!, 'companies', currentCompany.id);
      await updateDoc(companyRef, {
        name: editName.trim(),
        updated_at: serverTimestamp(),
      });

      const hasStripeSub =
        Boolean(currentCompany.stripe_subscription_id) && currentCompany.legacy !== true;
      if (hasStripeSub && editVehicleCount.trim()) {
        const nextCount = Number(editVehicleCount);
        const prevCount = Number(currentCompany.subscribed_vehicles) || null;
        if (!Number.isInteger(nextCount) || nextCount < 1 || nextCount > 500) {
          throw new Error('Vehicle slots must be a whole number between 1 and 500.');
        }
        if (prevCount !== nextCount) {
          const user = firebaseAuth.currentUser;
          if (!user) throw new Error('Not signed in');
          const token = await user.getIdToken();
          const res = await fetch('/api/admin/set-vehicle-quantity', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              company_id: currentCompany.id,
              vehicle_count: nextCount,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || 'Failed to update vehicle slots');
          }
          setQuantityMessage(
            data.message ||
              `Vehicle slots set to ${nextCount}. Charged from next billing cycle (no immediate proration).`
          );
        }
      }

      setIsEditModalOpen(false);
      setCurrentCompany(null);
      setEditName('');
      setEditVehicleCount('');
      await fetchCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
      alert(error instanceof Error ? error.message : 'Failed to update company.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!firebaseDb || !deleteTarget) return;
    setProcessing(true);
    try {
      await deleteDoc(doc(firebaseDb!, 'companies', deleteTarget.id));
      setDeleteTarget(null);
      await fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company.');
    } finally {
      setProcessing(false);
    }
  };

  const openEditModal = (company: CompanyWithCounts) => {
    setCurrentCompany(company);
    setEditName(company.name || '');
    setEditVehicleCount(
      company.subscribed_vehicles && company.subscribed_vehicles > 0
        ? String(company.subscribed_vehicles)
        : ''
    );
    setQuantityMessage(null);
    setIsEditModalOpen(true);
  };

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert('Could not copy ID.');
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'plan' || key === 'status' ? 'asc' : 'desc');
    }
  };

  const displayed = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let rows = companies.filter((company) => {
      if (statusFilter !== 'all' && statusBucket(company.subscription_status) !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        (company.name || '').toLowerCase().includes(q) || company.id.toLowerCase().includes(q)
      );
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const cmp = (left: string | number, right: string | number) => {
        if (left < right) return -1 * dir;
        if (left > right) return 1 * dir;
        return 0;
      };
      switch (sortKey) {
        case 'name':
          return cmp((a.name || '').toLowerCase(), (b.name || '').toLowerCase());
        case 'vehicles':
          return cmp(a.vehiclesCount, b.vehiclesCount);
        case 'users':
          return cmp(a.usersCount, b.usersCount);
        case 'status':
          return cmp(statusBucket(a.subscription_status), statusBucket(b.subscription_status));
        case 'plan':
          return cmp(planLabel(a).toLowerCase(), planLabel(b).toLowerCase());
        case 'trialEnds': {
          const at = getTrialEndDate(a)?.getTime() ?? 0;
          const bt = getTrialEndDate(b)?.getTime() ?? 0;
          return cmp(at, bt);
        }
        case 'lastInspection': {
          const at = a.lastInspectionAt?.getTime() ?? 0;
          const bt = b.lastInspectionAt?.getTime() ?? 0;
          return cmp(at, bt);
        }
        case 'created': {
          const at = toDate(a.created_at)?.getTime() ?? 0;
          const bt = toDate(b.created_at)?.getTime() ?? 0;
          return cmp(at, bt);
        }
        default:
          return 0;
      }
    });

    return rows;
  }, [companies, searchTerm, statusFilter, sortKey, sortDir]);

  const SortTh = ({
    label,
    column,
    className = '',
  }: {
    label: string;
    column: SortKey;
    className?: string;
  }) => (
    <th className={`px-3 sm:px-4 py-3 font-medium ${className}`}>
      <button
        type="button"
        onClick={() => toggleSort(column)}
        className="inline-flex items-center gap-1 uppercase hover:text-white transition-colors"
      >
        {label}
        <ArrowUpDown
          className={`h-3 w-3 ${sortKey === column ? 'text-blue-400' : 'text-white/30'}`}
          aria-hidden
        />
      </button>
    </th>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Companies</h1>
          <p className="text-white/70 text-sm mt-1">
            Manage all companies and view their statistics
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Company
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="text"
            placeholder="Search companies…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-black border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
          />
        </div>
        <label className="text-sm text-white/70 inline-flex items-center gap-2">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white outline-none"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      <div className="bg-black border border-blue-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-blue-500/20 text-white/70 text-xs uppercase">
              <tr>
                <SortTh label="Company" column="name" />
                <SortTh label="Vehicles" column="vehicles" />
                <SortTh label="Users" column="users" />
                <SortTh label="Status" column="status" className="hidden md:table-cell" />
                <SortTh label="Plan" column="plan" className="hidden lg:table-cell" />
                <SortTh label="Trial ends" column="trialEnds" className="hidden lg:table-cell" />
                <SortTh
                  label="Last inspection"
                  column="lastInspection"
                  className="hidden xl:table-cell"
                />
                <SortTh label="Created" column="created" className="hidden xl:table-cell" />
                <th className="px-3 sm:px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-white/50">
                    Loading companies…
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-white/50">
                    No companies found.
                  </td>
                </tr>
              ) : (
                displayed.map((company) => {
                  const bucket = statusBucket(company.subscription_status);
                  const trialEnd = getTrialEndDate(company);
                  return (
                    <tr key={company.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/40" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm sm:text-base truncate">
                              {company.name || 'Unnamed Company'}
                            </p>
                            <button
                              type="button"
                              onClick={() => void copyId(company.id)}
                              className="inline-flex items-center gap-1 text-white/40 hover:text-blue-400 text-xs mt-0.5"
                              title="Copy company ID"
                              aria-label="Copy company ID"
                            >
                              {copiedId === company.id ? (
                                <Check className="h-3 w-3 text-green-400" aria-hidden />
                              ) : (
                                <Copy className="h-3 w-3" aria-hidden />
                              )}
                              <span>ID</span>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-white/40" aria-hidden />
                            <span className="text-white text-sm">{company.vehiclesCount}</span>
                          </div>
                          {company.legacy ? (
                            <span
                              className="inline-flex items-center gap-1 text-amber-400/80 text-[11px] pl-5"
                              title="Legacy company — unlimited vehicle access. Slot billing does not apply."
                            >
                              legacy
                              <Info className="h-3 w-3" aria-hidden />
                            </span>
                          ) : company.subscribed_vehicles ? (
                            <span
                              className="inline-flex items-center gap-1 text-white/40 text-[11px] pl-5"
                              title="Subscribed vehicle slots on the Stripe plan (billing quantity), not the current fleet count."
                            >
                              slots {company.subscribed_vehicles}
                              <Info className="h-3 w-3" aria-hidden />
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-white/40" aria-hidden />
                          <span className="text-white text-sm">{company.usersCount}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${
                            bucket === 'active'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : bucket === 'trial'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-white/10 text-white/60 border border-white/20'
                          }`}
                        >
                          {bucket}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-white/80 text-sm hidden lg:table-cell">
                        {planLabel(company)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-white/70 text-sm hidden lg:table-cell">
                        {bucket === 'trial' ? formatAdminDate(trialEnd) : '—'}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-white/70 text-sm hidden xl:table-cell">
                        {formatAdminDate(company.lastInspectionAt)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-white/70 text-sm hidden xl:table-cell">
                        {formatAdminDate(company.created_at)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(company)}
                            className="p-1.5 sm:p-2 text-white/60 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit company"
                            aria-label="Edit company"
                          >
                            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
                          </button>
                          <AdminRowMenu onDelete={() => setDeleteTarget(company)} />
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

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Company"
      >
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="Company Name"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewCompanyName('');
              }}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
            >
              {processing ? 'Creating…' : 'Create Company'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={currentCompany ? `Edit ${currentCompany.name || 'Company'}` : 'Edit Company'}
      >
        <form onSubmit={handleEditCompany} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="Company Name"
            />
          </div>
          {currentCompany?.legacy === true ? (
            <p className="text-xs text-amber-300/90 leading-relaxed">
              Legacy company — unlimited vehicle access. Slot billing does not apply.
            </p>
          ) : currentCompany?.stripe_subscription_id ? (
            <div>
              <label className="block text-sm text-white/70 mb-1">Subscribed vehicle slots</label>
              <input
                type="number"
                min={1}
                max={500}
                step={1}
                value={editVehicleCount}
                onChange={(e) => setEditVehicleCount(e.target.value)}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                placeholder="e.g. 3"
              />
              <p className="mt-2 text-xs text-white/50 leading-relaxed">
                Updates Stripe quantity + app limit together. No immediate charge — new amount bills from
                the next cycle. Cannot go below their current non-retired vehicle count
                {typeof currentCompany.vehiclesCount === 'number'
                  ? ` (fleet shows ${currentCompany.vehiclesCount} vehicles total).`
                  : '.'}
              </p>
              {quantityMessage ? (
                <p className="mt-2 text-xs text-green-400">{quantityMessage}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-white/45 leading-relaxed">
              No Stripe subscription on this company — vehicle slots are not editable here.
            </p>
          )}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
            >
              {processing ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <TypeToConfirmDelete
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCompany}
        title="Delete company"
        confirmValue={deleteTarget?.name || deleteTarget?.id || ''}
        confirmLabel="company name"
        warning="This will permanently delete the company record. Associated fleet data is not automatically removed. This cannot be undone."
        processing={processing}
      />
    </div>
  );
}
