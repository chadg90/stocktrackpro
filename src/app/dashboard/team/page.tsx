'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Trash2, Search, Mail, User as UserIcon, Pencil, ShieldOff } from 'lucide-react';
import Modal from '../components/Modal';

type Profile = {
  id: string; // uid
  company_id: string;
  role: 'admin' | 'manager' | 'user';
  displayName?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
};

type Company = {
  id: string;
  name?: string;
};

type Invite = {
  id: string;
  email: string;
  role: string;
  company_id: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: any;
};

export default function TeamPage() {
  const [team, setTeam] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [processing, setProcessing] = useState(false);

  // Edit user modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<Profile['role']>('user');
  const [editCompanyId, setEditCompanyId] = useState('');

  // Temp account creation modal (admin only)
  const [isTempAccountModalOpen, setIsTempAccountModalOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [tempFirstName, setTempFirstName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [tempRole, setTempRole] = useState<Profile['role']>('user');
  const [tempCompanyId, setTempCompanyId] = useState('');

  // Company info for admin actions
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Check permissions
  const isAdmin = currentUserProfile?.role === 'admin';
  const canDelete = isAdmin; // per request, delete/edit is admin only now

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await import('firebase/firestore').then(mod => mod.getDoc(profileRef));
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setCurrentUserProfile({...data, id: user.uid});
          if (data.company_id) {
            fetchTeam(data.company_id);
            fetchInvites(data.company_id);
            fetchCompany(data.company_id);
            if (data.role === 'admin') {
              fetchCompanies();
            }
          }
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const fetchTeam = async (companyId: string) => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      const q = query(collection(firebaseDb!, 'profiles'), where('company_id', '==', companyId));
      const snapshot = await getDocs(q);
      const teamData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
      setTeam(teamData);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async (companyId: string) => {
    if (!firebaseDb || !companyId) return;
    try {
      const companyRef = doc(firebaseDb!, 'companies', companyId);
      const snap = await import('firebase/firestore').then(mod => mod.getDoc(companyRef));
      if (snap.exists()) {
        const data = snap.data() as { name?: string };
        setCompanyName(data.name);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  };

  const fetchInvites = async (companyId: string) => {
    if (!firebaseDb) return;
    try {
      const q = query(collection(firebaseDb!, 'invites'), where('company_id', '==', companyId));
      const snapshot = await getDocs(q);
      const invitesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invite));
      setInvites(invitesData);
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const fetchCompanies = async () => {
    if (!firebaseDb) return;
    try {
      const q = query(collection(firebaseDb!, 'companies'));
      const snapshot = await getDocs(q);
      const companyList = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as { name?: string }) }));
      setCompanies(companyList);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const openEditUser = (member: Profile) => {
    setEditingUser(member);
    setEditDisplayName(member.displayName || member.name || member.email?.split('@')[0] || '');
    setEditRole(member.role);
    setEditCompanyId(member.company_id || '');
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !editingUser || !isAdmin) return;
    setProcessing(true);
    try {
      await import('firebase/firestore').then(mod =>
        mod.updateDoc(mod.doc(firebaseDb!, 'profiles', editingUser.id), {
          displayName: editDisplayName.trim() || null,
          role: editRole,
          company_id: editCompanyId.trim(),
        })
      );
      if (currentUserProfile?.company_id) fetchTeam(currentUserProfile.company_id);
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!firebaseDb || !isAdmin || !currentUserProfile?.company_id) return;
    const companyId = currentUserProfile.company_id;
    if (!confirm(`Delete company "${companyName || companyId}"? This cannot be undone and will orphan related data.`)) return;
    try {
      await import('firebase/firestore').then(mod =>
        mod.deleteDoc(mod.doc(firebaseDb!, 'companies', companyId))
      );
      alert('Company deleted. Please sign out.');
      setCompanyName(undefined);
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company.');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !currentUserProfile?.company_id) return;
    
    setProcessing(true);
    try {
      await addDoc(collection(firebaseDb!, 'invites'), {
        email: inviteEmail.toLowerCase().trim(),
        role: inviteRole,
        company_id: currentUserProfile.company_id,
        created_at: serverTimestamp(),
        status: 'pending',
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Simple token generation
      });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('user');
      fetchInvites(currentUserProfile.company_id);
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (userId === currentUserProfile?.id) {
      alert("You cannot remove yourself.");
      return;
    }
    
    if (!confirm('Are you sure you want to remove this user? This will delete their account.') || !firebaseDb) return;
    
    try {
      // Deleting profile triggers cloud function to delete Auth user
      await deleteDoc(doc(firebaseDb!, 'profiles', userId));
      if (currentUserProfile?.company_id) fetchTeam(currentUserProfile.company_id);
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Failed to remove user.');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm('Cancel this invitation?') || !firebaseDb) return;
    
    try {
      await deleteDoc(doc(firebaseDb!, 'invites', inviteId));
      if (currentUserProfile?.company_id) fetchInvites(currentUserProfile.company_id);
    } catch (error) {
      console.error('Error cancelling invite:', error);
    }
  };

  const handleCreateTempAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseAuth || !firebaseDb || !isAdmin) return;
    
    if (!tempEmail || !tempPassword || !tempCompanyId) {
      alert('Please fill in email, password, and select a company.');
      return;
    }

    setProcessing(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, tempEmail.trim(), tempPassword);
      const newUserId = userCredential.user.uid;

      // Create profile in Firestore with the user's UID as the document ID
      await setDoc(doc(firebaseDb!, 'profiles', newUserId), {
        email: tempEmail.trim(),
        company_id: tempCompanyId,
        role: tempRole,
        first_name: tempFirstName.trim() || null,
        last_name: tempLastName.trim() || null,
        displayName: tempFirstName.trim() || tempLastName.trim() ? `${tempFirstName.trim()} ${tempLastName.trim()}`.trim() : null,
        created_at: serverTimestamp(),
      });

      setIsTempAccountModalOpen(false);
      setTempEmail('');
      setTempPassword('');
      setTempFirstName('');
      setTempLastName('');
      setTempRole('user');
      setTempCompanyId('');
      
      // Refresh team list if viewing the same company
      if (currentUserProfile?.company_id === tempCompanyId) {
        fetchTeam(tempCompanyId);
      }
      
      alert(`Temporary account created successfully! User can now login with:\nEmail: ${tempEmail}\nPassword: [as set]`);
    } catch (error: any) {
      console.error('Error creating temp account:', error);
      alert(error.message || 'Failed to create temporary account. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const displayNameFor = (member: Profile) => {
    // Try first_name + last_name first
    if (member.first_name || member.last_name) {
      return `${member.first_name || ''} ${member.last_name || ''}`.trim();
    }
    // Fall back to displayName, name, email prefix
    return member.displayName || member.name || member.email?.split('@')[0] || 'Unnamed User';
  };

  const filteredTeam = team.filter(member => 
    displayNameFor(member).toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Management</h1>
          <p className="text-white/70 text-sm mt-1">Manage your team members and permissions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsTempAccountModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-primary/40 text-primary hover:border-primary hover:bg-primary/10 transition-colors"
                title="Admin only: create temporary account"
              >
                <UserIcon className="h-4 w-4" />
                Create Temp Account
              </button>
              <button
                onClick={handleDeleteCompany}
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-red-400/40 text-red-200 hover:border-red-300 hover:text-red-100 transition-colors"
                title="Admin only: delete this company record"
              >
                <ShieldOff className="h-4 w-4" />
                Delete Company
              </button>
            </>
          )}
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Mail className="h-5 w-5" />
          Invite Member
        </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/30" />
        </div>
        <input
          type="text"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-96 bg-black border border-primary/30 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
        />
      </div>

      {/* Team Table */}
      <div className="bg-black border border-primary/20 rounded-xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-primary/20 text-white/70 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/50">
                    Loading team...
                  </td>
                </tr>
              ) : filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/50">
                    No team members found.
                  </td>
                </tr>
              ) : (
                filteredTeam.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-5 w-5 text-white/40" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {displayNameFor(member)}
                          </p>
                          {member.id === currentUserProfile?.id && (
                            <span className="text-xs text-primary">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${member.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/30' : 
                          member.role === 'manager' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-white/10 text-white/60 border border-white/20'}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && (
                          <button
                            onClick={() => openEditUser(member)}
                            className="p-2 text-white/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && member.id !== currentUserProfile?.id && (
                          <button 
                            onClick={() => handleRemoveUser(member.id)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invites Section */}
      {invites.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-white mb-4">Pending Invites</h2>
          <div className="bg-black border border-primary/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-primary/20 text-white/70 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {invites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white">
                        {invite.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/70 capitalize">{invite.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 capitalize">
                          {invite.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleCancelInvite(invite.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Member"
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="colleague@company.com"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-white/50 mt-1">
              Admins have full access. Managers can manage assets and fleet. Users are read-only or limited.
            </p>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
            >
              {processing ? 'Sending Invite...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingUser ? `Edit ${displayNameFor(editingUser)}` : 'Edit User'}
      >
        <form onSubmit={handleEditUser} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Display Name</label>
            <input
              type="text"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="Name"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Role</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as Profile['role'])}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Company ID</label>
            <select
              value={editCompanyId}
              onChange={(e) => setEditCompanyId(e.target.value)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              required
            >
              <option value="" disabled>Select company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.id}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/50 mt-1">Admin-only: move user to another company.</p>
          </div>
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
              className="px-4 py-2 rounded-lg bg-primary text-black font-semibold hover:bg-primary-light disabled:opacity-60"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Temp Account Modal (Admin Only) */}
      <Modal
        isOpen={isTempAccountModalOpen}
        onClose={() => setIsTempAccountModalOpen(false)}
        title="Create Temporary Account"
      >
        <form onSubmit={handleCreateTempAccount} className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <p className="text-yellow-200 text-xs">
              This creates a temporary account that the user can login with immediately. Use this while setting up Google Play Store access.
            </p>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Password *</label>
            <input
              type="password"
              required
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="Minimum 6 characters"
              minLength={6}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">First Name</label>
              <input
                type="text"
                value={tempFirstName}
                onChange={(e) => setTempFirstName(e.target.value)}
                className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Last Name</label>
              <input
                type="text"
                value={tempLastName}
                onChange={(e) => setTempLastName(e.target.value)}
                className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Role *</label>
            <select
              value={tempRole}
              onChange={(e) => setTempRole(e.target.value as Profile['role'])}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              required
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Company *</label>
            <select
              value={tempCompanyId}
              onChange={(e) => setTempCompanyId(e.target.value)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              required
            >
              <option value="" disabled>Select company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.id}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTempAccountModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 rounded-lg bg-primary text-black font-semibold hover:bg-primary-light disabled:opacity-60"
            >
              {processing ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
