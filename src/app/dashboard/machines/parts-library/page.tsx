'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { Package, Plus, Search, Trash2, Upload, Loader2, CheckCircle } from 'lucide-react';

type Part = {
  id: string;
  name: string;
  category?: string;
  description?: string;
};

export default function PartsLibraryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [newPartName, setNewPartName] = useState('');
  const [newPartCategory, setNewPartCategory] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  const [csvLoading, setCsvLoading] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!firebaseAuth) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) setIdToken(await user.getIdToken());
    });
    return () => unsub();
  }, []);

  const fetchParts = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const params = search ? `?q=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/plant-parts${params}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) setParts((await res.json()).parts ?? []);
    } finally {
      setLoading(false);
    }
  }, [idToken, search]);

  useEffect(() => {
    const t = setTimeout(fetchParts, 300);
    return () => clearTimeout(t);
  }, [fetchParts]);

  async function handleAddPart(e: React.FormEvent) {
    e.preventDefault();
    if (!idToken || !newPartName.trim()) return;
    setAddError('');
    setAddLoading(true);
    try {
      const res = await fetch('/api/plant-parts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPartName.trim(), category: newPartCategory.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error ?? 'Failed to add part'); return; }
      setNewPartName('');
      setNewPartCategory('');
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
      await fetchParts();
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDeletePart(id: string) {
    if (!idToken || !confirm('Delete this part from the library?')) return;
    await fetch(`/api/plant-parts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${idToken}` },
    });
    await fetchParts();
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !idToken) return;
    setCsvLoading(true);
    setCsvMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/plant-parts/import-csv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setCsvMessage(`Successfully imported ${data.imported} parts.`);
        await fetchParts();
      } else {
        setCsvMessage(data.error ?? 'CSV import failed');
      }
    } finally {
      setCsvLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-7 w-7 text-blue-400" />
            Parts Library
          </h1>
          <p className="text-sm text-white/50 mt-1">Shared parts catalogue used in plant inspection reports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={csvLoading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {csvLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
        </div>
      </div>

      {csvMessage && (
        <p className={`text-sm px-4 py-3 rounded-lg border ${csvMessage.includes('Successfully') ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {csvMessage}
        </p>
      )}

      <div className="text-xs text-white/40 bg-white/3 border border-white/10 rounded-lg p-3">
        CSV format: <code className="text-white/60">name,category,description</code> — header row required, max 500 rows.
      </div>

      {/* Add Part Form */}
      <form onSubmit={handleAddPart} className="bg-white/3 border border-white/10 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Add Part</h2>
        {addError && <p className="text-xs text-red-400 mb-3">{addError}</p>}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            required
            value={newPartName}
            onChange={(e) => setNewPartName(e.target.value)}
            placeholder="Part name *"
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <input
            value={newPartCategory}
            onChange={(e) => setNewPartCategory(e.target.value)}
            placeholder="Category (optional)"
            className="w-full sm:w-40 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            type="submit"
            disabled={addLoading || !newPartName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : addSuccess ? <CheckCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </div>
      </form>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Search parts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {/* Parts Table */}
      <div className="bg-white/3 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Part Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-white/40" /></td></tr>
            ) : parts.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-white/40">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No parts in library yet.</p>
              </td></tr>
            ) : parts.map((part) => (
              <tr key={part.id} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{part.name}</td>
                <td className="px-4 py-3 text-white/50 text-xs hidden sm:table-cell">{part.category ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDeletePart(part.id)}
                    className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {parts.length > 0 && (
          <div className="px-4 py-2 border-t border-white/10 text-xs text-white/40">
            {parts.length} part{parts.length !== 1 ? 's' : ''} in library
          </div>
        )}
      </div>
    </div>
  );
}
