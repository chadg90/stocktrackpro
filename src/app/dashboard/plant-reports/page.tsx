'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Edit,
} from 'lucide-react';
import type { PlantInspection, InspectionType, InspectionOutcome } from '@/types/plant';

const OUTCOME_STYLES: Record<InspectionOutcome, string> = {
  pass: 'bg-green-500/15 text-green-400 border-green-500/30',
  fail: 'bg-red-500/15 text-red-400 border-red-500/30',
  advisory: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
};

const INSPECTION_TYPES: { value: InspectionType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'LOLER', label: 'LOLER' },
  { value: 'PUWER', label: 'PUWER' },
  { value: 'service', label: 'Service' },
  { value: 'hire_check', label: 'Hire Check' },
];

const OUTCOMES: { value: InspectionOutcome | ''; label: string }[] = [
  { value: '', label: 'All Outcomes' },
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'advisory', label: 'Advisory' },
];

export default function PlantReportsPage() {
  const [inspections, setInspections] = useState<PlantInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<InspectionType | ''>('');
  const [outcomeFilter, setOutcomeFilter] = useState<InspectionOutcome | ''>('');
  const [selectedInspection, setSelectedInspection] = useState<PlantInspection | null>(null);

  // Amendment modal
  const [amendTarget, setAmendTarget] = useState<{ inspection: PlantInspection; field: string } | null>(null);
  const [amendValue, setAmendValue] = useState('');
  const [amendReason, setAmendReason] = useState('');
  const [amendLoading, setAmendLoading] = useState(false);
  const [amendError, setAmendError] = useState('');

  useEffect(() => {
    if (!firebaseAuth) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) setIdToken(await user.getIdToken());
    });
    return () => unsub();
  }, []);

  const fetchInspections = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (typeFilter) params.set('type', typeFilter);
      if (outcomeFilter) params.set('outcome', outcomeFilter);
      const res = await fetch(`/api/plant-inspections?${params}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) setInspections((await res.json()).inspections ?? []);
    } finally {
      setLoading(false);
    }
  }, [idToken, typeFilter, outcomeFilter]);

  useEffect(() => { fetchInspections(); }, [fetchInspections]);

  const filteredInspections = inspections.filter((i) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.machine_name?.toLowerCase().includes(s) ||
      i.machine_asset_number?.toLowerCase().includes(s) ||
      i.reference_number?.toLowerCase().includes(s) ||
      i.inspector_name?.toLowerCase().includes(s)
    );
  });

  async function handleAmend(e: React.FormEvent) {
    e.preventDefault();
    if (!amendTarget || !idToken) return;
    setAmendError('');
    setAmendLoading(true);
    try {
      const res = await fetch(`/api/plant-inspections/${amendTarget.inspection.id}/amend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: amendTarget.field, new_value: amendValue, reason: amendReason }),
      });
      const data = await res.json();
      if (!res.ok) { setAmendError(data.error ?? 'Amendment failed'); return; }
      setAmendTarget(null);
      setAmendValue('');
      setAmendReason('');
      await fetchInspections();
    } finally {
      setAmendLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-blue-400" />
          Plant Inspection Reports
        </h1>
        <p className="text-sm text-white/50 mt-1">LOLER, PUWER and service inspection records</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by machine, ref number, inspector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as InspectionType | '')}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {INSPECTION_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>)}
        </select>
        <select
          value={outcomeFilter}
          onChange={(e) => setOutcomeFilter(e.target.value as InspectionOutcome | '')}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {OUTCOMES.map((o) => <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/3 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Machine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden lg:table-cell">Inspector</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Outcome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-white/40" /></td></tr>
              ) : filteredInspections.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/40">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No inspection reports found.</p>
                </td></tr>
              ) : filteredInspections.map((insp) => (
                <tr key={insp.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{insp.reference_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{insp.machine_name}</div>
                    <div className="text-xs text-white/40">{insp.machine_asset_number}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      {insp.inspection_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60 hidden lg:table-cell text-xs">{insp.inspector_name}</td>
                  <td className="px-4 py-3 text-white/60 hidden sm:table-cell text-xs">
                    {insp.inspected_at ? new Date(insp.inspected_at as string).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${OUTCOME_STYLES[insp.outcome]}`}>
                      {insp.outcome === 'pass' && <CheckCircle className="h-3 w-3" />}
                      {insp.outcome === 'fail' && <XCircle className="h-3 w-3" />}
                      {insp.outcome === 'advisory' && <AlertCircle className="h-3 w-3" />}
                      {insp.outcome}
                    </span>
                    {insp.defects?.length > 0 && (
                      <span className="ml-1 text-xs text-orange-400">{insp.defects.length} defect{insp.defects.length !== 1 ? 's' : ''}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedInspection(insp)}
                      className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedInspection.reference_number}</h2>
                <p className="text-sm text-white/50">{selectedInspection.machine_name} — {selectedInspection.machine_asset_number}</p>
              </div>
              <button onClick={() => setSelectedInspection(null)} className="text-white/40 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-white/40">Type</span><p className="text-white font-medium">{selectedInspection.inspection_type}</p></div>
                <div><span className="text-white/40">Outcome</span>
                  <p className={`font-medium ${selectedInspection.outcome === 'pass' ? 'text-green-400' : selectedInspection.outcome === 'fail' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {selectedInspection.outcome}
                  </p>
                </div>
                <div><span className="text-white/40">Inspector</span><p className="text-white">{selectedInspection.inspector_name}</p></div>
                <div><span className="text-white/40">Date</span>
                  <p className="text-white">{selectedInspection.inspected_at ? new Date(selectedInspection.inspected_at as string).toLocaleDateString('en-GB') : '—'}</p>
                </div>
                <div><span className="text-white/40">Qualification</span><p className="text-white">{selectedInspection.inspector_qualification ?? '—'}</p></div>
                <div><span className="text-white/40">Next Due</span>
                  <p className="text-white">{selectedInspection.next_inspection_due ? new Date(selectedInspection.next_inspection_due as string).toLocaleDateString('en-GB') : '—'}</p>
                </div>
              </div>

              {selectedInspection.notes && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Notes</p>
                  <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">{selectedInspection.notes}</p>
                </div>
              )}

              {selectedInspection.defects?.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 mb-2">Defects ({selectedInspection.defects.length})</p>
                  <div className="space-y-2">
                    {selectedInspection.defects.map((d, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${d.severity === 'immediate' ? 'bg-red-500/15 text-red-400 border-red-500/30' : d.severity === 'monitor' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' : 'bg-white/10 text-white/50 border-white/20'}`}>
                            {d.severity}
                          </span>
                          <span className="text-white font-medium">{d.part_name}</span>
                        </div>
                        <p className="text-white/60">{d.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedInspection.amendments?.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 mb-2">Amendment Log ({selectedInspection.amendments.length})</p>
                  <div className="space-y-2">
                    {selectedInspection.amendments.map((a, i) => (
                      <div key={i} className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-xs text-white/70">
                        <span className="font-medium text-yellow-400">{a.field}</span> changed by {a.amended_by} — {a.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setAmendTarget({ inspection: selectedInspection, field: 'notes' }); setSelectedInspection(null); }}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/60 text-sm rounded-lg hover:bg-white/10 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Amend Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amendment Modal */}
      {amendTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-yellow-500/30 rounded-xl w-full max-w-md">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Amend Inspection Record</h2>
              <p className="text-xs text-white/40 mt-1">All amendments are logged with full audit trail</p>
            </div>
            <form onSubmit={handleAmend} className="p-5 space-y-4">
              {amendError && <p className="text-sm text-red-400">{amendError}</p>}
              <div>
                <label className="block text-xs text-white/60 mb-1">Field to Amend</label>
                <select
                  value={amendTarget.field}
                  onChange={(e) => setAmendTarget({ ...amendTarget, field: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                >
                  {['outcome', 'notes', 'next_inspection_due', 'inspector_qualification'].map(f => (
                    <option key={f} value={f} className="bg-gray-900">{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">New Value</label>
                <input
                  required
                  value={amendValue}
                  onChange={(e) => setAmendValue(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Reason for Amendment *</label>
                <textarea
                  required
                  rows={2}
                  value={amendReason}
                  onChange={(e) => setAmendReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAmendTarget(null)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={amendLoading}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {amendLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Amendment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
