'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Plus, Pencil, Search, HardHat, Archive } from 'lucide-react';
import Modal from '../components/Modal';
import ExportButton from '../components/ExportButton';
import { EmptyStateTableRow } from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import TablePagination, { PAGE_SIZE } from '../components/TablePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { companyHasPlantModuleAccess } from '@/lib/plant/access';
import { assertCanAddPlantMachine, getPlantMachineSeatLimit } from '@/lib/plant/machine-seats';

function computeNextDueFromLast(lastIso: string | null | undefined, intervalMonths: number): string | null {
  if (!lastIso?.trim() || !intervalMonths) return null;
  const d = new Date(lastIso.trim());
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + intervalMonths);
  return d.toISOString().slice(0, 10);
}

type PlantMachine = {
  id: string;
  company_id: string;
  plant_number: string;
  serial_number: string;
  internal_id?: string;
  make: string;
  model: string;
  year?: number;
  date_of_manufacture?: string;
  equipment_description?: string;
  usual_location?: string;
  safe_working_load: string;
  lifts_persons?: boolean;
  examination_interval_months?: number;
  examination_scheme?: boolean;
  last_examination_date?: string;
  next_examination_due?: string;
  prohibited?: boolean;
  prohibition_reason?: string;
  status?: string;
  is_active?: boolean;
};

type Profile = { company_id?: string; role?: string };

const inputClass =
  'w-full bg-white border border-zinc-400 rounded-lg px-3 py-2 text-zinc-900 focus:border-amber-600 outline-none dark:bg-black dark:border-amber-500/55 dark:text-white dark:focus:border-amber-500';

const emptyForm = (): Partial<PlantMachine> => ({
  plant_number: '',
  serial_number: '',
  make: '',
  model: '',
  safe_working_load: '',
  examination_interval_months: 12,
  lifts_persons: false,
  examination_scheme: false,
  is_active: true,
  status: 'operational',
});

function statusBadge(machine: PlantMachine) {
  if (machine.prohibited) {
    return { label: 'Prohibited', className: 'bg-red-500/10 text-red-600 border border-red-500/45 dark:text-red-400 dark:border-red-500/40' };
  }
  if (machine.next_examination_due) {
    const due = new Date(machine.next_examination_due);
    if (!Number.isNaN(due.getTime()) && due < new Date()) {
      return { label: 'Overdue', className: 'bg-amber-500/10 text-amber-800 border border-amber-600/50 dark:text-amber-300 dark:border-amber-500/45' };
    }
  }
  return { label: 'Operational', className: 'bg-green-500/10 text-green-700 border border-green-600/45 dark:text-green-400 dark:border-green-500/40' };
}

export default function PlantMachinesPage() {
  const [machines, setMachines] = useState<PlantMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasPlantModule, setHasPlantModule] = useState<boolean | null>(null);
  const [companyPlant, setCompanyPlant] = useState<Record<string, unknown> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [current, setCurrent] = useState<PlantMachine | null>(null);
  const [form, setForm] = useState<Partial<PlantMachine>>(emptyForm());
  const [processing, setProcessing] = useState(false);

  const isManager = profile?.role === 'manager' || profile?.role === 'admin';

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) {
        setLoading(false);
        return;
      }
      const snap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      const data = snap.data() as Profile;
      setProfile(data);
      if (data.company_id) {
        const companySnap = await getDoc(doc(firebaseDb, 'companies', data.company_id));
        const companyData = companySnap.exists() ? companySnap.data() : null;
        setCompanyPlant(companyData);
        setHasPlantModule(!!companyData && companyHasPlantModuleAccess(companyData));
        await fetchMachines(data.company_id);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchMachines = async (companyId: string) => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      const q = query(
        collection(firebaseDb, 'plant_machines'),
        where('company_id', '==', companyId),
        where('is_active', '==', true),
        orderBy('plant_number', 'asc')
      );
      const snap = await getDocs(q);
      setMachines(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PlantMachine)));
    } catch (e) {
      console.error('Error loading plant machines:', e);
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = (data: Partial<PlantMachine>, companyId: string, userId: string) => {
    const lifts = !!data.lifts_persons;
    let interval = Number(data.examination_interval_months) || 12;
    if (lifts) interval = 6;
    const lastIso = data.last_examination_date?.trim() || null;
    const nextDue =
      data.next_examination_due?.trim() ||
      computeNextDueFromLast(lastIso, interval) ||
      null;
    return {
      company_id: companyId,
      plant_number: (data.plant_number || '').trim(),
      serial_number: (data.serial_number || '').trim(),
      internal_id: data.internal_id?.trim() || null,
      make: (data.make || '').trim(),
      model: (data.model || '').trim(),
      year: data.year ? Number(data.year) : null,
      date_of_manufacture: data.date_of_manufacture || null,
      equipment_description: data.equipment_description?.trim() || null,
      usual_location: data.usual_location?.trim() || null,
      safe_working_load: (data.safe_working_load || '').trim() || null,
      lifts_persons: lifts,
      examination_interval_months: interval,
      examination_scheme: !!data.examination_scheme,
      last_examination_date: lastIso,
      next_examination_due: nextDue,
      prohibited: false,
      is_active: true,
      status: 'operational',
      created_by: userId,
    };
  };

  const activeMachineCount = useMemo(
    () => machines.filter((m) => m.is_active !== false).length,
    [machines]
  );
  const machineSeatLimit = getPlantMachineSeatLimit(companyPlant);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !profile?.company_id || !firebaseAuth?.currentUser) return;
    setProcessing(true);
    try {
      assertCanAddPlantMachine(companyPlant, activeMachineCount);
      await addDoc(collection(firebaseDb, 'plant_machines'), {
        ...buildPayload(form, profile.company_id, firebaseAuth.currentUser.uid),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      setIsAddOpen(false);
      setForm(emptyForm());
      fetchMachines(profile.company_id);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Could not add machine. Check that Plant module is enabled on your company.');
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !current || !profile?.company_id || !firebaseAuth?.currentUser) return;
    setProcessing(true);
    try {
      const payload = buildPayload(form, profile.company_id, firebaseAuth.currentUser.uid);
      delete (payload as { created_by?: string }).created_by;
      await updateDoc(doc(firebaseDb, 'plant_machines', current.id), {
        ...payload,
        updated_at: serverTimestamp(),
      });
      setIsEditOpen(false);
      setCurrent(null);
      setForm(emptyForm());
      fetchMachines(profile.company_id);
    } catch (err) {
      console.error(err);
      alert('Could not update machine.');
    } finally {
      setProcessing(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this machine? It will be hidden from lists but inspection history is kept.') || !firebaseDb) return;
    try {
      await updateDoc(doc(firebaseDb, 'plant_machines', id), {
        is_active: false,
        updated_at: serverTimestamp(),
      });
      if (profile?.company_id) fetchMachines(profile.company_id);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = machines.filter(
    (m) =>
      m.plant_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.serial_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.make?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.model?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  useEffect(() => setCurrentPage(1), [debouncedSearch]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  const formFields = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-600 dark:text-white/70 mb-1">Plant No *</label>
          <input className={inputClass} required value={form.plant_number || ''} onChange={(e) => setForm({ ...form, plant_number: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-white/70 mb-1">Serial No *</label>
          <input className={inputClass} required value={form.serial_number || ''} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-600 dark:text-white/70 mb-1">Make *</label>
          <input className={inputClass} required value={form.make || ''} onChange={(e) => setForm({ ...form, make: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-white/70 mb-1">Model *</label>
          <input className={inputClass} required value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-white/70 mb-1">Safe working load (if applicable)</label>
        <input className={inputClass} placeholder="Optional — e.g. 2500kg, 3.2 tonnes" value={form.safe_working_load || ''} onChange={(e) => setForm({ ...form, safe_working_load: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-600 dark:text-white/70 mb-1">Date of manufacture</label>
          <input className={inputClass} placeholder="YYYY-MM-DD" value={form.date_of_manufacture || ''} onChange={(e) => setForm({ ...form, date_of_manufacture: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-white/70 mb-1">Next exam due</label>
          <input className={inputClass} placeholder="YYYY-MM-DD" value={form.next_examination_due || ''} onChange={(e) => setForm({ ...form, next_examination_due: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-white/70 mb-1">Usual location (LOLER)</label>
        <input className={inputClass} value={form.usual_location || ''} onChange={(e) => setForm({ ...form, usual_location: e.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-white/80">
        <input type="checkbox" checked={!!form.lifts_persons} onChange={(e) => setForm({ ...form, lifts_persons: e.target.checked, examination_interval_months: e.target.checked ? 6 : 12 })} className="rounded border-amber-500/50" />
        Lifts persons (6-month LOLER interval)
      </label>
    </>
  );

  return (
    <div>
      {hasPlantModule === false && (
        <div className="mb-6 p-4 rounded-xl border border-amber-600/55 bg-amber-500/10 text-amber-950 text-sm dark:border-amber-500/50 dark:text-amber-100">
          <strong>Plant module not active</strong> on your company yet.{' '}
          {isManager ? (
            <>
              <a href="/pricing" className="underline font-semibold text-amber-800 dark:text-amber-200">
                Subscribe on the pricing page
              </a>{' '}
              (Plant &amp; Machinery card), or for legacy accounts set{' '}
              <code className="text-amber-800 dark:text-amber-200">legacy: true</code> on your company
              document.
            </>
          ) : (
            <>Ask your manager to enable the Plant add-on.</>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <HardHat className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            Plant &amp; Machinery
          </h1>
          <p className="text-zinc-600 dark:text-white/70 text-sm mt-1">
            Register machines here — they sync to the mobile app for inspectors.
            {machineSeatLimit != null && (
              <span className="block mt-1 text-amber-800 dark:text-amber-200/90">
                Subscription: {activeMachineCount} of {machineSeatLimit} machines registered.
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            data={machines}
            filename="plant-machines"
            fieldMappings={{
              plant_number: 'Plant No',
              serial_number: 'Serial',
              make: 'Make',
              model: 'Model',
              safe_working_load: 'SWL',
              next_examination_due: 'Next Due',
              status: 'Status',
            }}
          />
          {isManager && (
            <button
              type="button"
              disabled={machineSeatLimit != null && activeMachineCount >= machineSeatLimit}
              onClick={() => { setForm(emptyForm()); setIsAddOpen(true); }}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              Add Machine
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 dark:text-white/30" />
        <input
          type="text"
          placeholder="Search plant no, serial, make, model…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-96 bg-white border border-zinc-400 rounded-lg px-4 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-amber-600 outline-none dark:bg-black dark:border-amber-500/55 dark:text-white dark:placeholder:text-white/40 dark:focus:border-amber-500"
        />
      </div>

      <div className="bg-white border border-zinc-400 rounded-xl overflow-hidden shadow-sm dark:bg-black dark:border-amber-500/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-100 border-b border-zinc-400 text-zinc-600 text-sm uppercase dark:bg-white/5 dark:border-amber-500/55 dark:text-white/70">
              <tr>
                <th className="px-6 py-4 font-medium">Plant / Machine</th>
                <th className="px-6 py-4 font-medium">Serial</th>
                <th className="px-6 py-4 font-medium">SWL</th>
                <th className="px-6 py-4 font-medium">Next due</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {isManager && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-300 dark:divide-amber-500/35">
              {loading ? (
                <TableSkeleton cols={isManager ? 6 : 5} />
              ) : filtered.length === 0 ? (
                <EmptyStateTableRow colSpan={isManager ? 6 : 5} message="No machines yet. Add your first plant asset to get started." />
              ) : (
                paginated.map((m) => {
                  const badge = statusBadge(m);
                  return (
                    <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-white/5">
                      <td className="px-6 py-4">
                        <p className="text-zinc-900 dark:text-white font-medium">{m.plant_number}</p>
                        <p className="text-zinc-500 dark:text-white/50 text-sm">{m.make} {m.model}</p>
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-white/80 font-mono text-sm">{m.serial_number}</td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-white/80 text-sm">{m.safe_working_load || '—'}</td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-white/70 text-sm">{m.next_examination_due || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      {isManager && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => { setCurrent(m); setForm(m); setIsEditOpen(true); }} className="p-2 text-zinc-500 hover:text-amber-600 dark:text-white/60 dark:hover:text-amber-400 rounded-lg" aria-label="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => handleArchive(m.id)} className="p-2 text-zinc-500 hover:text-red-600 dark:text-white/60 dark:hover:text-red-400 rounded-lg" aria-label="Archive">
                              <Archive className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <TablePagination currentPage={currentPage} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      <p className="mt-6 text-sm text-zinc-500 dark:text-white/50">
        Inspections are completed in the Fleet Track PRO mobile app.
      </p>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Machine">
        <form onSubmit={handleAdd} className="space-y-4">
          {formFields}
          <button type="submit" disabled={processing} className="w-full py-3 bg-amber-500 text-black font-semibold rounded-lg disabled:opacity-50">
            {processing ? 'Saving…' : 'Add Machine'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Machine">
        <form onSubmit={handleEdit} className="space-y-4">
          {formFields}
          <button type="submit" disabled={processing} className="w-full py-3 bg-amber-500 text-black font-semibold rounded-lg disabled:opacity-50">
            {processing ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
