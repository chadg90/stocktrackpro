'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import {
  HardHat,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Loader2,
  RefreshCw,
  ShieldOff,
  ShieldCheck,
} from 'lucide-react';
import type { Machine, MachineCategory, RegulationType, MachineStatus } from '@/types/plant';

const CATEGORY_LABELS: Record<MachineCategory, string> = {
  lifting_equipment: 'Lifting Equipment (LOLER)',
  work_equipment: 'Work Equipment (PUWER)',
  access_equipment: 'Access Equipment',
  earth_moving: 'Earth Moving',
  other: 'Other',
};

const STATUS_STYLES: Record<MachineStatus, string> = {
  active: 'bg-green-500/15 text-green-400 border-green-500/30',
  prohibited: 'bg-red-500/15 text-red-400 border-red-500/30',
  under_repair: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  retired: 'bg-white/10 text-white/50 border-white/20',
  on_hire: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const CATEGORIES: { value: MachineCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'lifting_equipment', label: 'Lifting Equipment' },
  { value: 'work_equipment', label: 'Work Equipment' },
  { value: 'access_equipment', label: 'Access Equipment' },
  { value: 'earth_moving', label: 'Earth Moving' },
  { value: 'other', label: 'Other' },
];

const REGULATION_TYPES: RegulationType[] = ['LOLER', 'PUWER', 'both'];

type AddMachineForm = {
  name: string;
  asset_number: string;
  serial_number: string;
  make: string;
  model: string;
  year: string;
  category: MachineCategory | '';
  regulation_type: RegulationType | '';
  next_loler_due: string;
  next_service_due: string;
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MachineCategory | ''>('');

  // Add machine modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddMachineForm>({
    name: '', asset_number: '', serial_number: '', make: '', model: '',
    year: '', category: '', regulation_type: '', next_loler_due: '', next_service_due: '',
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Prohibit / clear modal
  const [prohibitTarget, setProhibitTarget] = useState<Machine | null>(null);
  const [prohibitReason, setProhibitReason] = useState('');
  const [prohibitLoading, setProhibitLoading] = useState(false);
  const [clearTarget, setClearTarget] = useState<Machine | null>(null);
  const [clearLoading, setClearLoading] = useState(false);

  useEffect(() => {
    if (!firebaseAuth) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      }
    });
    return () => unsub();
  }, []);

  const fetchMachines = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await fetch(`/api/machines?${params}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMachines(data.machines ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [idToken, categoryFilter]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const filteredMachines = machines.filter((m) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(s) ||
      m.asset_number?.toLowerCase().includes(s) ||
      m.make?.toLowerCase().includes(s) ||
      m.model?.toLowerCase().includes(s)
    );
  });

  async function handleAddMachine(e: React.FormEvent) {
    e.preventDefault();
    if (!idToken) return;
    setAddError('');
    if (!addForm.category || !addForm.regulation_type) {
      setAddError('Please select a category and regulation type.');
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          year: addForm.year ? parseInt(addForm.year) : undefined,
          next_loler_due: addForm.next_loler_due || undefined,
          next_service_due: addForm.next_service_due || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error ?? 'Failed to add machine'); return; }
      setShowAddModal(false);
      setAddForm({ name: '', asset_number: '', serial_number: '', make: '', model: '', year: '', category: '', regulation_type: '', next_loler_due: '', next_service_due: '' });
      await fetchMachines();
    } finally {
      setAddLoading(false);
    }
  }

  async function handleProhibit() {
    if (!prohibitTarget || !idToken) return;
    setProhibitLoading(true);
    try {
      const res = await fetch(`/api/machines/${prohibitTarget.id}/prohibit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: prohibitReason }),
      });
      if (res.ok) {
        setProhibitTarget(null);
        setProhibitReason('');
        await fetchMachines();
      }
    } finally {
      setProhibitLoading(false);
    }
  }

  async function handleClearProhibition() {
    if (!clearTarget || !idToken) return;
    setClearLoading(true);
    try {
      const res = await fetch(`/api/machines/${clearTarget.id}/clear-prohibition`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        setClearTarget(null);
        await fetchMachines();
      }
    } finally {
      setClearLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HardHat className="h-7 w-7 text-blue-400" />
            Machine Register
          </h1>
          <p className="text-sm text-white/50 mt-1">LOLER &amp; PUWER plant and machinery compliance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Machine
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search machines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as MachineCategory | '')}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>
          ))}
        </select>
        <button onClick={fetchMachines} className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/3 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Machine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden md:table-cell">Regulation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden lg:table-cell">Next LOLER Due</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-white/40">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </td></tr>
              ) : filteredMachines.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-white/40">
                  <HardHat className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No machines found. Add your first machine to get started.</p>
                </td></tr>
              ) : filteredMachines.map((machine) => (
                <tr key={machine.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{machine.name}</div>
                    <div className="text-xs text-white/40">{machine.asset_number} {machine.make ? `· ${machine.make}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-white/60 hidden sm:table-cell">
                    {CATEGORY_LABELS[machine.category] ?? machine.category}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      {machine.regulation_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60 hidden lg:table-cell text-xs">
                    {machine.next_loler_due
                      ? new Date(machine.next_loler_due as string).toLocaleDateString('en-GB')
                      : <span className="text-white/30">Not set</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[machine.status] ?? STATUS_STYLES.active}`}>
                      {machine.status === 'prohibited' && <XCircle className="h-3 w-3" />}
                      {machine.status === 'active' && <CheckCircle className="h-3 w-3" />}
                      {machine.status === 'under_repair' && <AlertTriangle className="h-3 w-3" />}
                      {machine.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {machine.status !== 'prohibited' && machine.status !== 'retired' && (
                        <button
                          onClick={() => setProhibitTarget(machine)}
                          className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Prohibit from use"
                        >
                          <ShieldOff className="h-4 w-4" />
                        </button>
                      )}
                      {machine.status === 'prohibited' && (
                        <button
                          onClick={() => setClearTarget(machine)}
                          className="p-1.5 rounded-lg text-green-400/60 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          title="Clear prohibition"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Add Machine</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white"><XCircle className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddMachine} className="p-5 space-y-4">
              {addError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{addError}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-white/60 mb-1">Machine Name *</label>
                  <input required value={addForm.name} onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. 20T Excavator" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Asset Number *</label>
                  <input required value={addForm.asset_number} onChange={(e) => setAddForm(f => ({ ...f, asset_number: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="EX-001" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Serial Number</label>
                  <input value={addForm.serial_number} onChange={(e) => setAddForm(f => ({ ...f, serial_number: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Make</label>
                  <input value={addForm.make} onChange={(e) => setAddForm(f => ({ ...f, make: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Model</label>
                  <input value={addForm.model} onChange={(e) => setAddForm(f => ({ ...f, model: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Category *</label>
                  <select required value={addForm.category} onChange={(e) => setAddForm(f => ({ ...f, category: e.target.value as MachineCategory }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="" className="bg-gray-900">Select...</option>
                    {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Regulation *</label>
                  <select required value={addForm.regulation_type} onChange={(e) => setAddForm(f => ({ ...f, regulation_type: e.target.value as RegulationType }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="" className="bg-gray-900">Select...</option>
                    {REGULATION_TYPES.map(r => <option key={r} value={r} className="bg-gray-900">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Next LOLER Due</label>
                  <input type="date" value={addForm.next_loler_due} onChange={(e) => setAddForm(f => ({ ...f, next_loler_due: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Next Service Due</label>
                  <input type="date" value={addForm.next_service_due} onChange={(e) => setAddForm(f => ({ ...f, next_service_due: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {addLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prohibit Modal */}
      {prohibitTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-xl w-full max-w-md">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldOff className="h-5 w-5 text-red-400" />
                Prohibit Machine
              </h2>
              <p className="text-sm text-white/50 mt-1">{prohibitTarget.name} — {prohibitTarget.asset_number}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Reason for Prohibition *</label>
                <textarea
                  value={prohibitReason}
                  onChange={(e) => setProhibitReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                  placeholder="Describe the fault or reason for prohibition..."
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setProhibitTarget(null); setProhibitReason(''); }}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleProhibit} disabled={!prohibitReason.trim() || prohibitLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {prohibitLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Prohibit Machine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Prohibition Modal */}
      {clearTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-green-500/30 rounded-xl w-full max-w-md p-5">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              Clear Prohibition
            </h2>
            <p className="text-sm text-white/60 mb-4">
              Are you sure you want to return <strong className="text-white">{clearTarget.name}</strong> ({clearTarget.asset_number}) to active service?
            </p>
            <p className="text-xs text-yellow-400/80 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
              Only clear the prohibition once the fault has been fully remedied and the machine has been re-inspected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setClearTarget(null)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={handleClearProhibition} disabled={clearLoading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {clearLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Clear &amp; Return to Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
