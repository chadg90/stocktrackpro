'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Plus, Trash2, Search, Key, Copy, Check } from 'lucide-react';
import Modal from '../components/Modal';

type AccessCode = {
  id: string;
  code: string;
  company_id: string;
  role: 'admin' | 'manager' | 'user';
  expires_at?: Timestamp | string;
  created_at?: Timestamp | string;
  used?: boolean;
  used_by?: string;
};

type Profile = {
  company_id?: string;
  role?: string;
};

const formatDate = (value?: string | Timestamp) => {
  if (!value) return '—';
  try {
    if (value instanceof Timestamp) {
      return value.toDate().toLocaleString();
    }
    return new Date(value).toLocaleString();
  } catch {
    return typeof value === 'string' ? value : '—';
  }
};

export default function AccessCodesPage() {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formRole, setFormRole] = useState<'admin' | 'manager' | 'user'>('user');

  // Reset form when modal opens
  const openGenerateModal = () => {
    setFormRole('user'); // Always default to user role
    setIsAddModalOpen(true);
  };
  const [processing, setProcessing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setProfile(data);
          // CRITICAL: Always use the logged-in user's company_id for data isolation
          // Managers and admins can access access codes for their company
          if (data.company_id && (data.role === 'admin' || data.role === 'manager')) {
            fetchAccessCodes(data.company_id);
          } else if (!data.company_id) {
            setLoading(false);
            console.error('User profile missing company_id');
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const fetchAccessCodes = async (companyId: string) => {
    if (!firebaseDb || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // CRITICAL: Always filter by company_id to ensure company data isolation
      const q = query(collection(firebaseDb!, 'access_codes'), where('company_id', '==', companyId));
      const snapshot = await getDocs(q);
      const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessCode));
      setAccessCodes(codesData);
    } catch (error) {
      console.error('Error fetching access codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    // Generate a 6-character alphanumeric code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !profile?.company_id || !canManageCodes) return;
    
    setProcessing(true);
    try {
      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // Expires in 1 day

      await addDoc(collection(firebaseDb!, 'access_codes'), {
        code,
        company_id: profile.company_id,
        role: formRole,
        expires_at: expiresAt.toISOString(),
        created_at: serverTimestamp(),
        used: false,
      });
      setIsAddModalOpen(false);
      fetchAccessCodes(profile.company_id);
      alert(`Access code generated: ${code}`);
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Delete this access code?') || !firebaseDb) return;
    
    try {
      await deleteDoc(doc(firebaseDb!, 'access_codes', codeId));
      if (profile?.company_id) fetchAccessCodes(profile.company_id);
    } catch (error) {
      console.error('Error deleting code:', error);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCodes = accessCodes.filter(code => 
    code.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isManager = profile?.role === 'manager';
  const canManageCodes = isAdmin || isManager;

  if (!canManageCodes) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-white/70">Only managers and administrators can manage access codes.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Access Codes</h1>
          <p className="text-white/70 text-sm mt-1">
            {isManager
              ? "Generate codes for new team members to join your company"
              : "Generate codes for new team members to join"
            }
          </p>
        </div>
        <button
          onClick={openGenerateModal}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus className="h-5 w-5" />
          Generate Code
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/30" />
        </div>
        <input
          type="text"
          placeholder="Search codes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-96 bg-black border border-primary/30 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-black border border-primary/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-primary/20 text-white/70 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Expires</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                    Loading access codes...
                  </td>
                </tr>
              ) : filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                    No access codes found. Generate one to get started.
                  </td>
                </tr>
              ) : (
                filteredCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Key className="h-4 w-4 text-primary" />
                        <span className="text-white font-mono text-lg">{code.code}</span>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="p-1.5 text-white/60 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === code.code ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${code.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/30' : 
                          code.role === 'manager' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-white/10 text-white/60 border border-white/20'}`}
                      >
                        {code.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${code.used ? 'bg-white/10 text-white/60' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}
                      >
                        {code.used ? 'Used' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {formatDate(code.expires_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteCode(code.id)}
                        className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Code"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Generate Access Code"
      >
        <form onSubmit={handleGenerateCode} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Role for New User</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as any)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
            >
              <option value="user">User</option>
              {isAdmin && <option value="manager">Manager</option>}
              {isAdmin && <option value="admin">Admin</option>}
            </select>
            <p className="text-xs text-white/50 mt-2">
              {isManager
                ? "The access code will be valid for 1 day and can be used once to create a new user account for your team."
                : "The access code will be valid for 1 day and can be used once to create a new account with this role."
              }
            </p>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
            >
              {processing ? 'Generating...' : 'Generate Code'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
