'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Trash2, Search, Mail, User as UserIcon, Pencil, ShieldOff } from 'lucide-react';
import Modal from '../components/Modal';
import { EmptyStateTableRow } from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import TablePagination, { PAGE_SIZE } from '../components/TablePagination';
import { useDebounce } from '@/hooks/useDebounce';

type Profile = {
  id: string; // uid
  company_id: string;
  role: 'admin' | 'manager' | 'user';
  first_name?: string;
  last_name?: string;
  display_name?: string;
  displayName?: string;
  name?: string;
  email?: string;
  phone?: string;
  last_login?: Timestamp | string;
};

type Company = {
  id: string;
  name?: string;
};

type Invite = {
  id: string;
  email: string;
  inviteeName?: string;
  role: 'manager' | 'user';
  companyId: string;
  companyName?: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt?: Timestamp | string;
  expiresAt?: Timestamp | string;
  emailSent?: boolean;
};


export default function TeamPage() {
  const [team, setTeam] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Modal states
  const [processing, setProcessing] = useState(false);

  // Edit user modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<Profile['role']>('user');
  const [editCompanyId, setEditCompanyId] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'user'>('user');
  const [inviteProcessing, setInviteProcessing] = useState(false);

  // Company info for admin actions
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesMap, setCompaniesMap] = useState<Record<string, string>>({});
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all'); // For admin filtering
  const [currentPage, setCurrentPage] = useState(1);

  // Check permissions
  const isAdmin = currentUserProfile?.role === 'admin';
  const isManager = currentUserProfile?.role === 'manager';
  const canEditUsers = isAdmin || isManager; // Managers can edit basic user info
  const canDeleteUsers = isAdmin; // Only admins can delete user accounts
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setCurrentUserProfile({...data, id: user.uid});
          if (data.company_id) {
            fetchCompany(data.company_id);
            fetchInvites(data.company_id);
          }
          if (data.role === 'admin') {
            await fetchCompanies();
            fetchAllUsers(); // Admins see all users
          } else if (data.company_id) {
            fetchTeam(data.company_id);
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
    setError(null);
    try {
      const q = query(collection(firebaseDb!, 'profiles'), where('company_id', '==', companyId));
      const snapshot = await getDocs(q);
      const teamData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
      setTeam(teamData);
    } catch (err) {
      console.error('Error fetching team:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async (companyId: string) => {
    if (!firebaseDb || !companyId) return;
    try {
      const q = query(collection(firebaseDb!, 'invites'), where('companyId', '==', companyId));
      const snapshot = await getDocs(q);
      const inviteData = snapshot.docs.map((inviteDoc) => ({ id: inviteDoc.id, ...inviteDoc.data() } as Invite));
      inviteData.sort((a, b) => {
        const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setInvites(inviteData);
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const fetchAllUsers = async () => {
    if (!firebaseDb) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(firebaseDb!, 'profiles'));
      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
      setTeam(allUsers);
    } catch (err) {
      console.error('Error fetching all users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async (companyId: string) => {
    if (!firebaseDb || !companyId) return;
    try {
      const companyRef = doc(firebaseDb!, 'companies', companyId);
      const snap = await getDoc(companyRef);
      if (snap.exists()) {
        const data = snap.data() as { name?: string };
        setCompanyName(data.name);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  };


  const fetchCompanies = async () => {
    if (!firebaseDb) return;
    try {
      const q = query(collection(firebaseDb!, 'companies'));
      const snapshot = await getDocs(q);
      const companyList = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as { name?: string }) }));
      setCompanies(companyList);
      // Create a map for quick company name lookup
      const map: Record<string, string> = {};
      companyList.forEach(c => {
        map[c.id] = c.name || c.id;
      });
      setCompaniesMap(map);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const openEditUser = (member: Profile) => {
    setEditingUser(member);
    setEditDisplayName(displayNameFor(member) || '');
    setEditRole(member.role);
    setEditCompanyId(member.company_id || '');
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !editingUser || !canEditUsers) return;
    setProcessing(true);
    try {
      const updateData: any = {
        displayName: editDisplayName.trim() || null,
      };

      // Only admins can change roles and company assignments
      if (isAdmin) {
        updateData.role = editRole;
        updateData.company_id = editCompanyId.trim();
      }

      await updateDoc(doc(firebaseDb!, 'profiles', editingUser.id), updateData);

      // Refresh team list
      if (isAdmin) {
        fetchAllUsers();
      } else if (currentUserProfile?.company_id) {
        fetchTeam(currentUserProfile.company_id);
      }
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
      await deleteDoc(doc(firebaseDb!, 'companies', companyId));
      alert('Company deleted. Please sign out.');
      setCompanyName(undefined);
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company.');
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
      // Refresh team list
      if (isAdmin) {
        fetchAllUsers();
      } else if (currentUserProfile?.company_id) {
        fetchTeam(currentUserProfile.company_id);
      }
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Failed to remove user.');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !currentUserProfile?.company_id) return;
    if (!inviteEmail.trim()) {
      alert('Please enter an email address.');
      return;
    }

    setInviteProcessing(true);
    try {
      const email = inviteEmail.trim().toLowerCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await addDoc(collection(firebaseDb, 'invites'), {
        email,
        inviteeName: inviteName.trim() || null,
        role: inviteRole,
        companyId: currentUserProfile.company_id,
        companyName: companyName || 'Stock Track PRO',
        invitedBy: currentUserProfile.id,
        invitedByName: displayNameFor(currentUserProfile),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt,
        emailSent: false,
      });

      setInviteEmail('');
      setInviteName('');
      setInviteRole('user');
      setIsInviteModalOpen(false);
      fetchInvites(currentUserProfile.company_id);
      alert(`Invite sent to ${email}`);
    } catch (error) {
      console.error('Error creating invite:', error);
      alert('Failed to create invite. Please try again.');
    } finally {
      setInviteProcessing(false);
    }
  };

  const displayNameFor = (member: Profile) => {
    // From profile: first_name + last_name > display_name > displayName > name > email prefix
    if (member.first_name || member.last_name) {
      return `${member.first_name || ''} ${member.last_name || ''}`.trim();
    }
    if (member.display_name) return member.display_name.trim();
    return member.displayName || member.name || member.email?.split('@')[0] || 'Unnamed User';
  };

  const formatDate = (value?: string | Timestamp) => {
    if (!value) return 'Never';
    try {
      if (value instanceof Timestamp) {
        return value.toDate().toLocaleString();
      }
      return new Date(value).toLocaleString();
    } catch {
      return typeof value === 'string' ? value : 'Never';
    }
  };

  // Filter team by search term and company (if admin)
  const filteredTeam = team.filter(member => {
    const matchesSearch = displayNameFor(member).toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    // If admin and company filter is set, also filter by company
    if (isAdmin && selectedCompanyFilter !== 'all') {
      return matchesSearch && member.company_id === selectedCompanyFilter;
    }
    
    return matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCompanyFilter]);

  const paginatedTeam = useMemo(
    () => filteredTeam.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredTeam, currentPage]
  );

  const handleRetry = () => {
    setError(null);
    if (isAdmin) fetchAllUsers();
    else if (currentUserProfile?.company_id) fetchTeam(currentUserProfile.company_id);
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex flex-wrap items-center justify-between gap-2" role="alert">
          <span>{error}</span>
          <button type="button" onClick={handleRetry} className="text-blue-500 hover:underline font-medium whitespace-nowrap">
            Try again
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Management</h1>
          <p className="text-white/70 text-sm mt-1">Manage your team members and permissions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(isAdmin || isManager) && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-blue-500/40 text-blue-400 hover:border-blue-400 hover:text-blue-300 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Invite Member
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleDeleteCompany}
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-red-400/40 text-red-200 hover:border-red-300 hover:text-red-100 transition-colors"
                title="Admin only: delete this company record"
              >
                <ShieldOff className="h-4 w-4" />
              Delete Company
            </button>
          )}
        </div>
      </div>

      {/* Search and Company Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-black border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
          />
        </div>
        {isAdmin && (
          <div className="sm:w-64">
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
            >
              <option value="all">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Team Table */}
      <div className="bg-black border border-blue-500/20 rounded-xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-blue-500/20 text-white/70 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Email</th>
                {isAdmin && <th className="px-6 py-4 font-medium">Company</th>}
                {isAdmin && <th className="px-6 py-4 font-medium">Last Login</th>}
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <TableSkeleton cols={isAdmin ? 6 : 4} />
              ) : filteredTeam.length === 0 ? (
                <EmptyStateTableRow colSpan={isAdmin ? 6 : 4} message="No team members found." />
              ) : (
                paginatedTeam.map((member) => (
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
                            <span className="text-xs text-blue-500">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${member.role === 'admin' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 
                          member.role === 'manager' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-white/10 text-white/60 border border-white/20'}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {member.email}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-white/70 text-sm">
                        {member.company_id ? (companiesMap[member.company_id] || member.company_id) : 'No Company'}
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-6 py-4 text-white/70 text-sm">
                        {formatDate(member.last_login)}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEditUsers && (
                          <button
                            onClick={() => openEditUser(member)}
                            className="p-2 text-white/60 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title={isManager ? "Edit User Info" : "Edit User"}
                            aria-label={isManager ? "Edit user info" : "Edit user"}
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </button>
                        )}
                        {canDeleteUsers && member.id !== currentUserProfile?.id && (
                          <button 
                            onClick={() => handleRemoveUser(member.id)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove User"
                            aria-label="Remove user from team"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
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
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredTeam.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {(isAdmin || isManager) && (
        <div className="bg-black border border-blue-500/20 rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-blue-500/20 bg-white/5">
            <h2 className="text-white font-semibold">Recent Invites</h2>
            <p className="text-white/60 text-sm mt-1">Track invite delivery and acceptance status.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-blue-500/20 text-white/70 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Sent</th>
                  <th className="px-6 py-3 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {invites.length === 0 ? (
                  <EmptyStateTableRow colSpan={5} message="No invites sent yet." />
                ) : (
                  invites.slice(0, 8).map((invite) => (
                    <tr key={invite.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3 text-white/80 text-sm">{invite.email}</td>
                      <td className="px-6 py-3 text-white/70 text-sm capitalize">{invite.role}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          invite.status === 'accepted'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : invite.status === 'pending'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-white/10 text-white/60 border border-white/20'
                        }`}>
                          {invite.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-white/70 text-sm">{invite.emailSent ? 'Yes' : 'Pending'}</td>
                      <td className="px-6 py-3 text-white/70 text-sm">{formatDate(invite.expiresAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="Name"
            />
          </div>
          {isAdmin && (
            <div>
              <label className="block text-sm text-white/70 mb-1">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as Profile['role'])}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          {isAdmin && (
            <div>
              <label className="block text-sm text-white/70 mb-1">Company ID</label>
              <select
                value={editCompanyId}
                onChange={(e) => setEditCompanyId(e.target.value)}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
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
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="driver@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Name (optional)</label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="Alex Driver"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'manager' | 'user')}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <p className="text-xs text-white/50">
            The invite link is valid for 7 days and can only be accepted once.
          </p>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteProcessing}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60"
            >
              {inviteProcessing ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
