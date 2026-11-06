'use client';

import DashboardPageTitle from '../components/DashboardPageTitle';

import React, { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { firebaseApp, firebaseAuth, firebaseDb, firebaseFunctions } from '@/lib/firebase';
import { Plus, Pencil, Search, Truck, AlertTriangle, Image as ImageIcon, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import ExportButton from '../components/ExportButton';
import ImageViewerModal from '../components/ImageViewerModal';
import AuthenticatedImage from '../components/AuthenticatedImage';
import LazyWhenVisible from '../components/LazyWhenVisible';
import { EmptyStateTableRow } from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import TablePagination, { PAGE_SIZE } from '../components/TablePagination';
import TypeToConfirmDelete from '../components/TypeToConfirmDelete';
import AdminRowMenu from '../components/AdminRowMenu';
import { useDebounce } from '@/hooks/useDebounce';
import { checkCanAddVehicle } from '@/lib/subscriptionLimits';
import {
  formatUkRegistration,
  formatVehicleMakeModel,
  isValidUkRegistrationShape,
  registrationKey,
} from '@/lib/ukVehicleRegistration';
import { storageObjectPathFromDownloadUrl } from '@/lib/storageThumbnail';
import PageGuideButton from '../components/PageGuide';

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
  const [saveSlow, setSaveSlow] = useState(false);
  const [dvlaStatus, setDvlaStatus] = useState<'idle' | 'loading' | 'ok' | 'fail'>('idle');
  const [dvlaMessage, setDvlaMessage] = useState('');

  // Image viewer state
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageAlt, setViewingImageAlt] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  /** recommend = retire first; confirm-delete = type registration to permanently delete */
  const [removeStep, setRemoveStep] = useState<'recommend' | 'confirm-delete' | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  /**
   * Confirm the Firestore photo path exists via getDownloadURL only (no folder
   * listing / thumb probe). Missing → null → "No image provided"; no console 404 img.
   */
  const resolveExistingInspectionImage = async (pathOrUrl: string): Promise<string | null> => {
    if (!pathOrUrl || !firebaseApp) return null;
    // Folder / prefix paths are not downloadable objects — skip Storage entirely.
    if (pathOrUrl.endsWith('/')) return null;

    const storage = getStorage(firebaseApp);

    let objectPath: string | null = null;
    if (/^https?:\/\//i.test(pathOrUrl)) {
      try {
        const host = new URL(pathOrUrl).hostname;
        const isFirebase =
          host.includes('firebasestorage.googleapis.com') ||
          host.includes('storage.googleapis.com') ||
          host.endsWith('.firebasestorage.app');
        if (!isFirebase) return pathOrUrl;
      } catch {
        return null;
      }
      objectPath = storageObjectPathFromDownloadUrl(pathOrUrl);
      if (!objectPath || objectPath.endsWith('/')) return null;
    } else {
      objectPath = pathOrUrl;
    }

    try {
      return await getDownloadURL(ref(storage, objectPath));
    } catch {
      return null;
    }
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

      // Only hit Storage when Firestore already has a photo path/URL — never list folders.
      const enrichedVehicles = await Promise.all(
        vehiclesData.map(async (vehicle) => {
          const fromInspection = inspectionsMap[vehicle.id]
            ? getInspectionPhoto(inspectionsMap[vehicle.id])
            : null;
          const candidate = vehicle.image_url || fromInspection;
          if (!candidate) return { ...vehicle, image_url: undefined };
          const existing = await resolveExistingInspectionImage(candidate);
          return { ...vehicle, image_url: existing || undefined };
        })
      );

      setVehicles(enrichedVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const findDuplicateRegistration = (reg: string, excludeId?: string) => {
    const key = registrationKey(reg);
    if (!key) return null;
    return (
      vehicles.find((v) => {
        if (excludeId && v.id === excludeId) return false;
        const status = String(v.status || 'active').toLowerCase();
        if (status === 'retired') return false;
        return registrationKey(v.registration) === key;
      }) || null
    );
  };

  const lookupRegistration = async (rawReg?: string) => {
    const registration = formatUkRegistration(rawReg ?? formData.registration ?? '');
    const regKey = registrationKey(registration);
    if (!regKey) {
      setDvlaStatus('idle');
      setDvlaMessage('');
      return;
    }
    setFormData((prev) => ({ ...prev, registration }));
    setDvlaStatus('loading');
    setDvlaMessage('Checking with DVLA…');
    try {
      const user = firebaseAuth?.currentUser;
      if (!user) {
        setDvlaStatus('fail');
        setDvlaMessage('Sign in to look up a registration, or fill in the details yourself.');
        return;
      }
      const idToken = await user.getIdToken();
      const res = await fetch('/api/vehicles/dvla-lookup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        // Always send uppercased, no spaces.
        body: JSON.stringify({ registration: regKey }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        make?: string | null;
        model?: string | null;
        year?: number | null;
        colour?: string | null;
        registration?: string;
        message?: string;
        statusCode?: number | null;
        error?: string;
      };
      if (data.ok) {
        setFormData((prev) => ({
          ...prev,
          registration: data.registration || registration,
          make: data.make ? formatVehicleMakeModel(data.make) : prev.make,
          model: data.model ? formatVehicleMakeModel(data.model) : prev.model,
        }));
        setDvlaStatus('ok');
        setDvlaMessage('Checked with DVLA');
      } else {
        setDvlaStatus('fail');
        const detail =
          data.message ||
          data.error ||
          (data.statusCode != null
            ? `Couldn't check this reg (DVLA ${data.statusCode}). Fill in the details yourself.`
            : "Couldn't check this reg. Fill in the details yourself.");
        setDvlaMessage(detail);
      }
    } catch (error) {
      console.warn('DVLA lookup failed:', error);
      setDvlaStatus('fail');
      setDvlaMessage("Couldn't reach DVLA lookup. Fill in the details yourself.");
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !firebaseFunctions || !profile?.company_id || processing) return;

    const registration = formatUkRegistration(formData.registration || '');
    const make = formatVehicleMakeModel(formData.make || '');
    const model = formatVehicleMakeModel(formData.model || '');
    if (!make || !model) {
      alert('Make and model are required.');
      return;
    }
    if (!isValidUkRegistrationShape(registration)) {
      alert('Enter a valid UK registration (letters and numbers only).');
      return;
    }
    if (findDuplicateRegistration(registration)) {
      alert(
        'An active vehicle with this registration already exists. Retire or edit the existing vehicle instead of adding a duplicate.'
      );
      return;
    }

    const limitCheck = await checkCanAddVehicle(firebaseDb, profile.company_id);
    if (!limitCheck.allowed) {
      alert(limitCheck.message ?? 'Vehicle limit reached for your plan.');
      return;
    }

    setProcessing(true);
    setSaveSlow(false);
    const slowTimer = window.setTimeout(() => setSaveSlow(true), 15000);
    try {
      const createVehicle = httpsCallable(firebaseFunctions, 'createVehicle');
      await createVehicle({
        vehicle: {
          make,
          model,
          registration,
          vin: (formData.vin || '').toUpperCase(),
          image_url: formData.image_url || '',
          status: formData.status || 'active',
          mileage: Number(formData.mileage) || 0,
        },
      });
      setIsAddModalOpen(false);
      setFormData({});
      setDvlaStatus('idle');
      setDvlaMessage('');
      fetchVehicles(profile.company_id);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      const code = String((error as { code?: string })?.code || '');
      alert(
        code.includes('already-exists')
          ? 'An active vehicle with this registration already exists. Retire or edit the existing vehicle instead of adding a duplicate.'
          : code.includes('resource-exhausted')
            ? 'Your company has reached its vehicle limit.'
            : code.includes('permission-denied')
              ? 'Only company managers can add vehicles.'
              : saveSlow
                ? 'This is taking longer than usual. Please try again in a moment.'
                : 'The vehicle could not be added. Please check the details and try again.'
      );
    } finally {
      window.clearTimeout(slowTimer);
      setProcessing(false);
      setSaveSlow(false);
    }
  };

  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !currentVehicle) return;

    const registration = formatUkRegistration(formData.registration || '');
    const make = formatVehicleMakeModel(formData.make || '');
    const model = formatVehicleMakeModel(formData.model || '');
    if (!make || !model) {
      alert('Make and model are required.');
      return;
    }
    if (!isValidUkRegistrationShape(registration)) {
      alert('Enter a valid UK registration (letters and numbers only).');
      return;
    }
    if (findDuplicateRegistration(registration, currentVehicle.id)) {
      alert('Another active vehicle already uses this registration.');
      return;
    }

    setProcessing(true);
    try {
      const vehicleRef = doc(firebaseDb!, 'vehicles', currentVehicle.id);
      await updateDoc(vehicleRef, {
        ...formData,
        make,
        model,
        registration,
        vin: formData.vin ? String(formData.vin).toUpperCase() : formData.vin,
        updated_at: serverTimestamp(),
        mileage: Number(formData.mileage) || 0,
      });
      setIsEditModalOpen(false);
      setCurrentVehicle(null);
      setFormData({});
      if (profile?.company_id) fetchVehicles(profile.company_id);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Could not update vehicle. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const closeRemoveFlow = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setRemoveStep(null);
  };

  const openRemoveFlow = (vehicle: Vehicle) => {
    setDeleteTarget(vehicle);
    setRemoveStep(vehicle.status === 'retired' ? 'confirm-delete' : 'recommend');
  };

  const handleRetireVehicle = async () => {
    if (!firebaseDb || !deleteTarget) return;
    setDeleting(true);
    try {
      await updateDoc(doc(firebaseDb!, 'vehicles', deleteTarget.id), {
        status: 'retired',
        updated_at: serverTimestamp(),
      });
      setDeleteTarget(null);
      setRemoveStep(null);
      if (profile?.company_id) fetchVehicles(profile.company_id);
    } catch (error) {
      console.error('Error retiring vehicle:', error);
      alert('Could not retire vehicle. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!firebaseDb || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(firebaseDb!, 'vehicles', deleteTarget.id));
      setDeleteTarget(null);
      setRemoveStep(null);
      if (profile?.company_id) fetchVehicles(profile.company_id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Could not delete vehicle. Please try again.');
    } finally {
      setDeleting(false);
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
      <DashboardPageTitle title="Vehicles" />
      <ImageViewerModal 
        isOpen={!!viewingImage} 
        onClose={() => setViewingImage(null)} 
        imageUrl={viewingImage} 
        altText={viewingImageAlt} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Vehicles</h1>
            <PageGuideButton pageId="fleet" />
          </div>
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
            data-tour="fleet-add"
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
      <div className="mb-6 relative" data-tour="fleet-search">
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

      {/* Mobile cards (<640px) */}
      <div className="sm:hidden space-y-3" data-tour="fleet-table">
        {loading ? (
          <div className="bg-black border border-blue-500/20 rounded-xl p-4 text-white/60 text-sm">Loading…</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="bg-black border border-blue-500/20 rounded-xl p-4 text-white/60 text-sm">
            No vehicles found. Add your first vehicle to get started.
          </div>
        ) : (
          paginatedVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-black border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-mono text-lg leading-tight">{vehicle.registration}</p>
                  <p className="text-white/60 text-sm mt-1 truncate">
                    {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize shrink-0
                    ${vehicle.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      vehicle.status === 'service_due' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      vehicle.status === 'maintenance' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-white/10 text-white/60 border border-white/20'}`}
                >
                  {vehicle.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-white/70 text-sm mt-3">
                {vehicle.mileage != null ? `${vehicle.mileage.toLocaleString()} mi` : '—'}
              </p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(vehicle)}
                  className="p-2 text-white/60 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Edit Vehicle"
                  aria-label="Edit vehicle"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
                {canDelete && <AdminRowMenu onDelete={() => openRemoveFlow(vehicle)} />}
              </div>
            </div>
          ))
        )}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredVehicles.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-black border border-blue-500/20 rounded-xl overflow-hidden" data-tour="fleet-table">
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
                              <LazyWhenVisible
                                className="w-full h-full"
                                placeholder={<div className="w-full h-full bg-white/10 animate-pulse rounded-lg" />}
                              >
                                <AuthenticatedImage
                                  src={vehicle.image_url}
                                  alt={vehicle.make || 'Vehicle Image'}
                                  className="w-full h-full object-cover"
                                />
                              </LazyWhenVisible>
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
                          <AdminRowMenu onDelete={() => openRemoveFlow(vehicle)} />
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
        onClose={() => {
          if (processing) return;
          setIsAddModalOpen(false);
          setDvlaStatus('idle');
          setDvlaMessage('');
        }}
        title="Add New Vehicle"
      >
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Registration</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.registration || ''}
                onChange={(e) => {
                  setDvlaStatus('idle');
                  setFormData({ ...formData, registration: formatUkRegistration(e.target.value) });
                }}
                onBlur={(e) => lookupRegistration(e.target.value)}
                className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none uppercase"
                placeholder="e.g. TE57 TST"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => lookupRegistration()}
                disabled={dvlaStatus === 'loading' || !registrationKey(formData.registration || '')}
                className="shrink-0 rounded-lg border border-blue-500/40 px-3 py-2 text-sm text-white/90 hover:bg-white/5 disabled:opacity-50"
              >
                {dvlaStatus === 'loading' ? '…' : 'Look up'}
              </button>
            </div>
            <p
              className={`text-xs mt-1 ${
                dvlaStatus === 'ok'
                  ? 'text-emerald-400'
                  : dvlaStatus === 'fail'
                    ? 'text-amber-300'
                    : 'text-white/40'
              }`}
            >
              {dvlaMessage || 'Capitals + UK spacing. Look up fills make when DVLA has it.'}
            </p>
          </div>
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
          <div className="pt-4 space-y-2">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg py-3 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding vehicle…
                </>
              ) : (
                'Add Vehicle'
              )}
            </button>
            {processing && saveSlow ? (
              <p className="text-xs text-amber-300 text-center">
                This is taking longer than usual. You can wait a moment longer, or close and try again.
              </p>
            ) : null}
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
              onChange={(e) =>
                setFormData({ ...formData, registration: formatUkRegistration(e.target.value) })
              }
              onBlur={(e) =>
                setFormData({ ...formData, registration: formatUkRegistration(e.target.value) })
              }
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none uppercase"
              placeholder="e.g. AB12 CDE"
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

      <Modal
        isOpen={Boolean(deleteTarget) && removeStep === 'recommend'}
        onClose={closeRemoveFlow}
        title="Remove vehicle?"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/80 leading-relaxed">
            We recommend <span className="font-semibold text-white">retiring</span>{' '}
            {deleteTarget?.registration || 'this vehicle'} instead of deleting it.
          </p>
          <ul className="text-sm text-white/65 space-y-2 list-disc pl-5 leading-relaxed">
            <li>Inspection and defect history stay linked for compliance records.</li>
            <li>Retired vehicles do not count toward your subscribed vehicle allowance.</li>
            <li>You can still see the vehicle in the list with a Retired status.</li>
          </ul>
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={() => setRemoveStep('confirm-delete')}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:border-red-400/50 hover:text-red-300 text-sm disabled:opacity-60"
            >
              Delete permanently…
            </button>
            <button
              type="button"
              onClick={() => void handleRetireVehicle()}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 text-sm disabled:opacity-60"
            >
              {deleting ? 'Retiring…' : 'Retire vehicle'}
            </button>
          </div>
        </div>
      </Modal>

      <TypeToConfirmDelete
        isOpen={Boolean(deleteTarget) && removeStep === 'confirm-delete'}
        onClose={closeRemoveFlow}
        onConfirm={handleDeleteVehicle}
        title="Delete vehicle permanently"
        confirmValue={deleteTarget?.registration || deleteTarget?.id || ''}
        confirmLabel="registration"
        warning="This permanently deletes the vehicle record from your fleet list. Linked inspection history is not removed, but the vehicle can no longer be managed here. Retiring is safer if you only need to free a vehicle slot. This cannot be undone."
        processing={deleting}
      />
    </div>
  );
}
