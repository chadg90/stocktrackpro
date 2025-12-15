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
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Plus, Trash2, Search, Mail, User as UserIcon } from 'lucide-react';
import Modal from '../components/Modal';

type Profile = {
  id: string; // uid
  company_id: string;
  role: 'admin' | 'manager' | 'user';
  displayName?: string;
  email?: string;
  phone?: string;
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

  // Check permissions
  const isAdmin = currentUserProfile?.role === 'admin';
  const canDelete = isAdmin || currentUserProfile?.role === 'manager';

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

  const filteredTeam = team.filter(member => 
    member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Management</h1>
          <p className="text-white/70 text-sm mt-1">Manage your team members and permissions</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Mail className="h-5 w-5" />
          Invite Member
        </button>
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
                            {member.displayName || member.email?.split('@')[0] || 'Unnamed User'}
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
    </div>
  );
}
