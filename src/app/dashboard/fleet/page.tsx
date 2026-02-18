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
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Plus, Pencil, Trash2, Search, Truck, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import Modal from '../components/Modal';
import ExportButton from '../components/ExportButton';
import ImageViewerModal from '../components/ImageViewerModal';
import AuthenticatedImage from '../components/AuthenticatedImage';
import { EmptyStateTableRow } from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import TablePagination, { PAGE_SIZE } from '../components/TablePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { checkCanAddVehicle } from '@/lib/subscriptionLimits';

type Vehicle = {
  id: string;
  make: string;
  model: string;
  registration: string;
  vin?: string;
  mileage?: number;
  status: 'active' | 'maintenance' | 'service_due' | 'retired';
  company_id: string;
  image_url?: string;
  next_service_date?: string;
  next_mot_date?: string;
};

type Inspection = {
  id: string;
  vehicle_id?: string;
  photo_urls?: Record<string, string>;
};

type Profile = {
  company_id?: string;
  role?: string;
};

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const [processing, setProcessing] = useState(false);

  // Image viewer state
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageAlt, setViewingImageAlt] = useState('');

  // Only admins can delete per policy; managers can add/edit
  const canDelete = profile?.role === 'admin';

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
          // Even admins can only see their own company's business data
          if (data.company_id) {
            fetchVehicles(data.company_id);
          } else {
            setLoading(false);
            console.error('User profile missing company_id');
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

  // Helper to extract photo from inspection photo_urls map
  const getInspectionPhoto = (inspection: Inspection): string | null => {
    if (!inspection?.photo_urls || typeof inspection.photo_urls !== 'object') return null;
    
    // Prefer specific angles in order
    const preferred = ['front', 'driver_side', 'passenger_side', 'rear', 'interior'];
    for (const key of preferred) {
      if (inspection.photo_urls[key] && typeof inspection.photo_urls[key] === 'string') {
        return inspection.photo_urls[key];
      }
    }
    
    // Fallback to first available URL
    const urls = Object.values(inspection.photo_urls).filter(v => typeof v === 'string') as string[];
    return urls.length > 0 ? urls[0] : null;
  };

  const fetchVehicles = async (companyId: string) => {
    if (!firebaseDb || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // CRITICAL: Always filter by company_id to ensure company data isolation
      // Fetch vehicles
      const vehiclesQ = query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId));
      const vehiclesSnap = await getDocs(vehiclesQ);
      const vehiclesData = vehiclesSnap.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data } as Vehicle;
      });

      // Fetch recent inspections to get photos
      const inspectionsQ = query(
        collection(firebaseDb!, 'vehicle_inspections'),
        where('company_id', '==', companyId),
        orderBy('inspected_at', 'desc'),
        limit(100) // Get recent inspections
      );
      
      let inspectionsMap: Record<string, Inspection> = {};
      try {
        const inspectionsSnap = await getDocs(inspectionsQ);
        inspectionsMap = {};
        // Since inspections are ordered by inspected_at desc, first one per vehicle_id is most recent
        inspectionsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.vehicle_id && !inspectionsMap[data.vehicle_id]) {
            inspectionsMap[data.vehicle_id] = { 
              id: doc.id, 
              vehicle_id: data.vehicle_id, 
              photo_urls: data.photo_urls 
            };
          }
        });
      } catch (err) {
        console.error('Error fetching inspections (non-critical):', err);
      }

      // Enrich vehicles with inspection photos if they don't have image_url
      const enrichedVehicles = vehiclesData.map(vehicle => {
        if (!vehicle.image_url && inspectionsMap[vehicle.id]) {
          const photoUrl = getInspectionPhoto(inspectionsMap[vehicle.id]);
          if (photoUrl) {
            return { ...vehicle, image_url: photoUrl };
          }
        }
        return vehicle;
      });

      setVehicles(enrichedVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !profile?.company_id) return;

    const limitCheck = await checkCanAddVehicle(firebaseDb, profile.company_id);
    if (!limitCheck.allowed) {
      alert(limitCheck.message ?? 'Vehicle limit reached for your plan.');
      return;
    }

    setProcessing(true);
    try {
      await addDoc(collection(firebaseDb!, 'vehicles'), {
        ...formData,
        company_id: profile.company_id,
        created_at: serverTimestamp(),
        status: formData.status || 'active',
        mileage: Number(formData.mileage) || 0,
      });
      setIsAddModalOpen(false);
      setFormData({});
      fetchVehicles(profile.company_id);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !currentVehicle) return;

    setProcessing(true);
    try {
      const vehicleRef = doc(firebaseDb!, 'vehicles', currentVehicle.id);
      await updateDoc(vehicleRef, {
        ...formData,
        updated_at: serverTimestamp(),
        mileage: Number(formData.mileage) || 0,
      });
      setIsEditModalOpen(false);
      setCurrentVehicle(null);
      setFormData({});
      if (profile?.company_id) fetchVehicles(profile.company_id);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.') || !firebaseDb) return;
    
    try {
      await deleteDoc(doc(firebaseDb!, 'vehicles', vehicleId));
      if (profile?.company_id) fetchVehicles(profile.company_id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const openEditModal = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setFormData(vehicle);
    setIsEditModalOpen(true);
  };

  const filteredVehicles = vehicles.filter(v => 
    v.registration?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    v.make?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    v.model?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const paginatedVehicles = useMemo(
    () => filteredVehicles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredVehicles, currentPage]
  );

  return (
    <div>
      <ImageViewerModal 
        isOpen={!!viewingImage} 
        onClose={() => setViewingImage(null)} 
        imageUrl={viewingImage} 
        altText={viewingImageAlt} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
          <p className="text-white/70 text-sm mt-1">Manage your vehicles and inspections</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            data={vehicles.map(v => ({
              id: v.id,
              registration: v.registration || '',
              make: v.make || '',
              model: v.model || '',
              year: (v as any).year || '',
              vin: (v as any).vin || '',
              mileage: (v as any).mileage || '',
              color: (v as any).color || '',
              status: (v as any).status || '',
            }))}
            filename="fleet"
            fieldMappings={{
              id: 'ID',
              registration: 'Registration',
              make: 'Make',
              model: 'Model',
              year: 'Year',
              vin: 'VIN',
              mileage: 'Mileage',
              color: 'Color',
              status: 'Status',
            }}
          />
          <button
            onClick={() => {
              setFormData({});
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Vehicle
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
          placeholder="Search by registration, make, or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-96 bg-black border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-black border border-blue-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-blue-500/20 text-white/70 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Vehicle Details</th>
                <th className="px-6 py-4 font-medium">Registration</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Mileage</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <TableSkeleton cols={5} />
              ) : filteredVehicles.length === 0 ? (
                <EmptyStateTableRow colSpan={5} message="No vehicles found. Add your first vehicle to get started." />
              ) : (
                paginatedVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              if (vehicle.image_url) {
                                setViewingImage(vehicle.image_url);
                                setViewingImageAlt(`${vehicle.make} ${vehicle.model}`);
                              }
                            }}
                            className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden ${vehicle.image_url ? 'hover:ring-2 hover:ring-blue-500 cursor-pointer' : ''}`}
                          >
                            {vehicle.image_url ? (
                              <AuthenticatedImage
                                src={vehicle.image_url}
                                alt={vehicle.make || 'Vehicle Image'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Truck className="h-5 w-5 text-white/40" />
                            )}
                          </button>
                          {!vehicle.image_url && (
                            <span className="text-xs text-white/50">No image provided</span>
                          )}
                          {vehicle.image_url && (
                            <a
                              href={vehicle.image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              Open image
                            </a>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{vehicle.make} {vehicle.model}</p>
                          <p className="text-white/50 text-xs">VIN: {vehicle.vin || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-mono">
                      {vehicle.registration}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${vehicle.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          vehicle.status === 'service_due' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          vehicle.status === 'maintenance' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-white/10 text-white/60 border border-white/20'}`}
                      >
                        {vehicle.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {vehicle.mileage?.toLocaleString()} mi
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(vehicle)}
                          className="p-2 text-white/60 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Vehicle"
                          aria-label="Edit vehicle"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        {canDelete && (
                          <button 
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Vehicle"
                            aria-label="Delete vehicle"
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
          totalItems={filteredVehicles.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vehicle"
      >
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Make</label>
              <input
                type="text"
                required
                value={formData.make || ''}
                onChange={(e) => setFormData({...formData, make: e.target.value})}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                placeholder="e.g. Ford"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Model</label>
              <input
                type="text"
                required
                value={formData.model || ''}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                placeholder="e.g. Transit"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Image URL</label>
            <input
              type="text"
              value={formData.image_url || ''}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Registration</label>
            <input
              type="text"
              required
              value={formData.registration || ''}
              onChange={(e) => setFormData({...formData, registration: e.target.value.toUpperCase()})}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="e.g. AB12 CDE"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">VIN (Optional)</label>
            <input
              type="text"
              value={formData.vin || ''}
              onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Current Mileage</label>
              <input
                type="number"
                value={formData.mileage || ''}
                onChange={(e) => setFormData({...formData, mileage: Number(e.target.value)})}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="service_due">Service Due</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
            >
              {processing ? 'Adding Vehicle...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Vehicle"
      >
        <form onSubmit={handleEditVehicle} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Make</label>
              <input
                type="text"
                required
                value={formData.make || ''}
                onChange={(e) => setFormData({...formData, make: e.target.value})}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Model</label>
              <input
                type="text"
                required
                value={formData.model || ''}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Image URL</label>
            <input
              type="text"
              value={formData.image_url || ''}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Registration</label>
            <input
              type="text"
              required
              value={formData.registration || ''}
              onChange={(e) => setFormData({...formData, registration: e.target.value.toUpperCase()})}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">VIN</label>
            <input
              type="text"
              value={formData.vin || ''}
              onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Current Mileage</label>
              <input
                type="number"
                value={formData.mileage || ''}
                onChange={(e) => setFormData({...formData, mileage: Number(e.target.value)})}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="service_due">Service Due</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
            >
              {processing ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
