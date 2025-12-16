'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Search, AlertTriangle, CheckCircle, Clock, Filter, Truck, Trash2 } from 'lucide-react';
import ImageViewerModal from '../components/ImageViewerModal';

type Defect = {
  id: string;
  vehicle_id?: string;
  reported_at?: Timestamp | string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  status: 'pending' | 'resolved' | 'investigating';
  company_id: string;
  photo_url?: string;
  photo_urls?: Record<string, string>;
  reported_by?: string;
  resolved_at?: Timestamp | string;
  resolved_by?: string;
};

type Vehicle = {
  id: string;
  registration: string;
  make: string;
  model: string;
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

// Safely pick a photo url from possible fields
const firstPhotoUrl = (defect: any): string | null => {
  // Check for simple photo_url string
  if (defect?.photo_url && typeof defect.photo_url === 'string') {
    return defect.photo_url;
  }
  
  // Check for photo_urls map
  if (defect?.photo_urls && typeof defect.photo_urls === 'object') {
    const vals = Object.values(defect.photo_urls).filter((v) => typeof v === 'string') as string[];
    if (vals.length > 0) {
      return vals[0];
    }
  }
  
  return null;
};

export default function DefectsPage() {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  
  // Check if user is admin
  const isAdmin = profile?.role === 'admin';
  
  // Image viewer state
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageAlt, setViewingImageAlt] = useState('');

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await import('firebase/firestore').then(mod => mod.getDoc(profileRef));
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setProfile(data);
          // CRITICAL: Always use the logged-in user's company_id for data isolation
          // Even admins can only see their own company's business data
          if (data.company_id) {
            fetchData(data.company_id);
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

  const fetchData = async (companyId: string) => {
    if (!firebaseDb || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // CRITICAL: Always filter by company_id to ensure company data isolation
      // Fetch vehicles first for mapping
      const vehiclesQ = query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId));
      const vehiclesSnap = await getDocs(vehiclesQ);
      const vehiclesMap: Record<string, Vehicle> = {};
      vehiclesSnap.docs.forEach(doc => {
        vehiclesMap[doc.id] = { id: doc.id, ...doc.data() } as Vehicle;
      });
      setVehicles(vehiclesMap);

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

      // Fetch defects
      const defectsQ = query(
        collection(firebaseDb!, 'vehicle_defects'), 
        where('company_id', '==', companyId),
        orderBy('reported_at', 'desc')
      );
      const defectsSnap = await getDocs(defectsQ);
      const defectsData = defectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Defect));
      
      // Enrich defects with inspection photos if they don't have their own photos
      const enrichedDefects = defectsData.map(defect => {
        // If defect already has a photo, keep it
        if (firstPhotoUrl(defect)) {
          return defect;
        }
        
        // Otherwise, try to get photo from vehicle's latest inspection
        if (defect.vehicle_id && inspectionsMap[defect.vehicle_id]) {
          const photoUrl = getInspectionPhoto(inspectionsMap[defect.vehicle_id]);
          if (photoUrl) {
            return { ...defect, photo_url: photoUrl };
          }
        }
        
        return defect;
      });
      
      setDefects(enrichedDefects);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDefect = async (defectId: string) => {
    if (!confirm('Mark this defect as resolved?') || !firebaseDb) return;
    
    try {
      const defectRef = doc(firebaseDb!, 'vehicle_defects', defectId);
      await updateDoc(defectRef, {
        status: 'resolved',
        resolved_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      
      // Update local state
      setDefects(prev => prev.map(d => 
        d.id === defectId ? { ...d, status: 'resolved' } : d
      ));
    } catch (error) {
      console.error('Error resolving defect:', error);
      alert('Failed to resolve defect');
    }
  };

  const handleDeleteDefect = async (defectId: string) => {
    if (!isAdmin) {
      alert('Only admins can delete defects.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this defect? This action cannot be undone.') || !firebaseDb) return;
    
    try {
      await deleteDoc(doc(firebaseDb!, 'vehicle_defects', defectId));
      
      // Update local state
      setDefects(prev => prev.filter(d => d.id !== defectId));
      alert('Defect deleted successfully.');
    } catch (error) {
      console.error('Error deleting defect:', error);
      alert('Failed to delete defect.');
    }
  };

  const filteredDefects = defects.filter(d => {
    const matchesSearch = 
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.vehicle_id && vehicles[d.vehicle_id]?.registration.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'pending' 
        ? d.status !== 'resolved' 
        : d.status === 'resolved';

    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-white">Defect Management</h1>
          <p className="text-white/70 text-sm mt-1">Track and resolve reported vehicle issues</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="text"
            placeholder="Search by vehicle registration or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-black border border-primary/30 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-black border border-primary/30 rounded-lg p-1">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'pending' 
                ? 'bg-primary text-black' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'resolved' 
                ? 'bg-primary text-black' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'all' 
                ? 'bg-primary text-black' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-black border border-primary/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-primary/20 text-white/70 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Vehicle</th>
                <th className="px-6 py-4 font-medium">Issue Description</th>
                <th className="px-6 py-4 font-medium">Reported</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/50">
                    Loading defects...
                  </td>
                </tr>
              ) : filteredDefects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/50">
                    No defects found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDefects.map((defect) => {
                  const vehicle = defect.vehicle_id ? vehicles[defect.vehicle_id] : null;
                  return (
                    <tr key={defect.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase
                          ${defect.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                            defect.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            defect.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}
                        >
                          {defect.severity || 'low'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-white/40" />
                          <div>
                            <p className="text-white text-sm font-medium">
                              {vehicle ? vehicle.registration : 'Unknown Vehicle'}
                            </p>
                            <p className="text-white/50 text-xs">
                              {vehicle ? `${vehicle.make} ${vehicle.model}` : defect.vehicle_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white/90 text-sm line-clamp-2 max-w-xs" title={defect.description}>
                          {defect.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {firstPhotoUrl(defect) ? (
                            <>
                              <button 
                                onClick={() => {
                                  const url = firstPhotoUrl(defect);
                                  if (url) {
                                    setViewingImage(url);
                                    setViewingImageAlt(defect.description || 'Defect Photo');
                                  }
                                }}
                                className="text-primary text-xs hover:underline inline-flex items-center gap-1"
                              >
                                View Photo
                              </button>
                              <a
                                href={firstPhotoUrl(defect) || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-white/60 hover:text-primary"
                              >
                                Open
                              </a>
                            </>
                          ) : (
                            <span className="text-xs text-white/50">No photo provided</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-50" />
                          {formatDate(defect.reported_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {defect.status === 'resolved' ? (
                          <span className="inline-flex items-center gap-1.5 text-green-400 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-yellow-400 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {defect.status !== 'resolved' && (
                            <button
                              onClick={() => handleResolveDefect(defect.id)}
                              className="text-sm bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteDefect(defect.id)}
                              className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Defect (Admin Only)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
