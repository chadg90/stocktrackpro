'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Plus, Pencil, Trash2, Search, MapPin } from 'lucide-react';
import Modal from '../components/Modal';

type Location = {
  id: string;
  name: string;
  address?: string;
  company_id: string;
  created_at?: any;
};

type Profile = {
  company_id?: string;
  role?: string;
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Partial<Location>>({});
  const [processing, setProcessing] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const canManage = profile?.role === 'admin' || profile?.role === 'manager';

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await import('firebase/firestore').then(mod => mod.getDoc(profileRef));
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setProfile(data);
          if (data.company_id) {
            fetchLocations(data.company_id);
          }
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const fetchLocations = async (companyId: string) => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      const q = query(collection(firebaseDb!, 'locations'), where('company_id', '==', companyId));
      const snapshot = await getDocs(q);
      const locationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
      setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !profile?.company_id || !canManage) return;
    
    setProcessing(true);
    try {
      await addDoc(collection(firebaseDb!, 'locations'), {
        ...formData,
        company_id: profile.company_id,
        created_at: serverTimestamp(),
      });
      setIsAddModalOpen(false);
      setFormData({});
      fetchLocations(profile.company_id);
    } catch (error) {
      console.error('Error adding location:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !currentLocation || !canManage) return;

    setProcessing(true);
    try {
      const locationRef = doc(firebaseDb!, 'locations', currentLocation.id);
      await updateDoc(locationRef, {
        ...formData,
        updated_at: serverTimestamp(),
      });
      setIsEditModalOpen(false);
      setCurrentLocation(null);
      setFormData({});
      if (profile?.company_id) fetchLocations(profile.company_id);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!isAdmin) {
      alert('Only admins can delete locations.');
      return;
    }
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.') || !firebaseDb) return;
    
    try {
      await deleteDoc(doc(firebaseDb!, 'locations', locationId));
      if (profile?.company_id) fetchLocations(profile.company_id);
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const openEditModal = (location: Location) => {
    setCurrentLocation(location);
    setFormData(location);
    setIsEditModalOpen(true);
  };

  const filteredLocations = locations.filter(loc => 
    loc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Locations</h1>
          <p className="text-white/70 text-sm mt-1">Manage your company locations and sites</p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setFormData({});
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-black px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Location
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/30" />
        </div>
        <input
          type="text"
          placeholder="Search locations..."
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
                <th className="px-6 py-4 font-medium">Location Name</th>
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-white/50">
                    Loading locations...
                  </td>
                </tr>
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-white/50">
                    No locations found. Add your first location to get started.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-white/40" />
                        </div>
                        <p className="text-white font-medium">{location.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {location.address || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManage && (
                          <button 
                            onClick={() => openEditModal(location)}
                            className="p-2 text-white/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit Location"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteLocation(location.id)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Location (Admin Only)"
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

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Location"
      >
        <form onSubmit={handleAddLocation} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Location Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="e.g. Warehouse A"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Address (Optional)</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              rows={3}
              placeholder="Full address"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
            >
              {processing ? 'Adding Location...' : 'Add Location'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Location"
      >
        <form onSubmit={handleEditLocation} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Location Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Address</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              rows={3}
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
            >
              {processing ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
