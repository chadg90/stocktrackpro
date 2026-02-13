'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Clock, Search, Package, Truck, Image as ImageIcon } from 'lucide-react';
import ExportButton from '../components/ExportButton';
import ImageViewerModal from '../components/ImageViewerModal';
import AuthenticatedImage from '../components/AuthenticatedImage';

type HistoryItem = {
  id: string;
  tool_id?: string;
  action?: string;
  user_id?: string;
  timestamp?: Timestamp | string;
  details?: string;
  user_email?: string;
};

type InspectionItem = {
  id: string;
  vehicle_id?: string;
  inspected_by?: string;
  inspected_at?: Timestamp | string;
  has_defect?: boolean;
  mileage?: number;
  notes?: string;
  photo_urls?: Record<string, string>;
};

type Profile = {
  id: string;
  company_id?: string;
  role?: string;
  displayName?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

type Tool = {
  id: string;
  name?: string;
  brand?: string;
  model?: string;
};

type Vehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
  name?: string;
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

export default function HistoryPage() {
  const [assetHistory, setAssetHistory] = useState<HistoryItem[]>([]);
  const [vehicleInspections, setVehicleInspections] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'assets' | 'fleet'>('assets');
  const [tools, setTools] = useState<Record<string, Tool>>({});
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [users, setUsers] = useState<Record<string, Profile>>({});
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageAlt, setViewingImageAlt] = useState<string>('');
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  
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
            fetchHistory(data.company_id);
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

  const fetchHistory = async (companyId: string) => {
    if (!firebaseDb || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // CRITICAL: Always filter by company_id to ensure company data isolation
      // Fetch tools for mapping
      const toolsQ = query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId));
      const toolsSnap = await getDocs(toolsQ);
      const toolsMap: Record<string, Tool> = {};
      toolsSnap.docs.forEach(doc => {
        toolsMap[doc.id] = { id: doc.id, ...doc.data() } as Tool;
      });
      setTools(toolsMap);

      // Fetch vehicles for mapping
      const vehiclesQ = query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId));
      const vehiclesSnap = await getDocs(vehiclesQ);
      const vehiclesMap: Record<string, Vehicle> = {};
      vehiclesSnap.docs.forEach(doc => {
        vehiclesMap[doc.id] = { id: doc.id, ...doc.data() } as Vehicle;
      });
      setVehicles(vehiclesMap);

      // Fetch users for mapping
      const usersQ = query(collection(firebaseDb!, 'profiles'), where('company_id', '==', companyId));
      const usersSnap = await getDocs(usersQ);
      const usersMap: Record<string, Profile> = {};
      usersSnap.docs.forEach(doc => {
        usersMap[doc.id] = { id: doc.id, ...doc.data() } as Profile;
      });
      setUsers(usersMap);

      // Fetch asset history (tool_history)
      let assetHistoryQ;
      try {
        assetHistoryQ = query(
          collection(firebaseDb!, 'tool_history'),
          where('company_id', '==', companyId),
          orderBy('timestamp', 'desc'),
          limit(500)
        );
        
        const assetHistorySnap = await getDocs(assetHistoryQ);
        const assetHistoryData = assetHistorySnap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as HistoryItem));
        
        console.log('[History] Fetched asset history items:', assetHistoryData.length);
        setAssetHistory(assetHistoryData);
      } catch (historyError: any) {
        console.error('[History] Error fetching asset history (may need Firestore index):', historyError);
        // Fallback: fetch without orderBy if index missing
        if (historyError?.code === 'failed-precondition' || historyError?.message?.includes('index')) {
          console.warn('[History] Missing Firestore index, fetching without orderBy');
          try {
            const fallbackQ = query(
              collection(firebaseDb!, 'tool_history'),
              where('company_id', '==', companyId),
              limit(500)
            );
            const fallbackSnap = await getDocs(fallbackQ);
            const assetHistoryData = fallbackSnap.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            } as HistoryItem));
            // Sort manually by timestamp descending
            assetHistoryData.sort((a, b) => {
              const aTime = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : 
                           (a.timestamp ? new Date(a.timestamp as string).getTime() : 0);
              const bTime = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : 
                           (b.timestamp ? new Date(b.timestamp as string).getTime() : 0);
              return bTime - aTime;
            });
            console.log('[History] Fetched asset history items (fallback):', assetHistoryData.length);
            setAssetHistory(assetHistoryData);
          } catch (fallbackError) {
            console.error('[History] Fallback query also failed:', fallbackError);
            setAssetHistory([]);
          }
        } else {
          setAssetHistory([]);
        }
      }

      // Fetch vehicle inspections
      let inspectionsQ;
      try {
        inspectionsQ = query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          orderBy('inspected_at', 'desc'),
          limit(500)
        );
        
        const inspectionsSnap = await getDocs(inspectionsQ);
        const inspectionsData = inspectionsSnap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as InspectionItem));
        
        console.log('[History] Fetched vehicle inspections:', inspectionsData.length);
        setVehicleInspections(inspectionsData);
      } catch (inspectionsError: any) {
        console.error('[History] Error fetching vehicle inspections (may need Firestore index):', inspectionsError);
        // Fallback: fetch without orderBy if index missing
        if (inspectionsError?.code === 'failed-precondition' || inspectionsError?.message?.includes('index')) {
          console.warn('[History] Missing Firestore index for inspections, fetching without orderBy');
          try {
            const fallbackQ = query(
              collection(firebaseDb!, 'vehicle_inspections'),
              where('company_id', '==', companyId),
              limit(500)
            );
            const fallbackSnap = await getDocs(fallbackQ);
            const inspectionsData = fallbackSnap.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            } as InspectionItem));
            // Sort manually by inspected_at descending
            inspectionsData.sort((a, b) => {
              const aTime = a.inspected_at instanceof Timestamp ? a.inspected_at.toMillis() : 
                           (a.inspected_at ? new Date(a.inspected_at as string).getTime() : 0);
              const bTime = b.inspected_at instanceof Timestamp ? b.inspected_at.toMillis() : 
                           (b.inspected_at ? new Date(b.inspected_at as string).getTime() : 0);
              return bTime - aTime;
            });
            console.log('[History] Fetched vehicle inspections (fallback):', inspectionsData.length);
            setVehicleInspections(inspectionsData);
          } catch (fallbackError) {
            console.error('[History] Fallback query for inspections also failed:', fallbackError);
            setVehicleInspections([]);
          }
        } else {
          setVehicleInspections([]);
        }
      }
    } catch (error: any) {
      console.error('[History] Error fetching history:', error);
      // If it's an index error, log it clearly
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        console.error('[History] Firestore index missing. Create composite index for:', {
          collection: 'tool_history',
          fields: ['company_id', 'timestamp']
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredAssetHistory = assetHistory.filter(item => 
    item.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tool_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVehicleInspections = vehicleInspections.filter(item => 
    item.vehicle_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.inspected_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.has_defect && 'defect'.includes(searchTerm.toLowerCase()))
  );

  const getCurrentData = () => {
    if (activeTab === 'assets') {
      return filteredAssetHistory.map(item => {
        const tool = item.tool_id ? tools[item.tool_id] : null;
        const user = item.user_id ? users[item.user_id] : null;
        let userName = 'Unknown';
        if (user) {
          if (user.first_name || user.last_name) {
            userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          } else {
            userName = user.displayName || user.name || user.email?.split('@')[0] || 'Unknown';
          }
        } else if (item.user_id) {
          userName = item.user_id;
        }
        const toolName = tool ? (tool.name || `${tool.brand} ${tool.model}`.trim() || item.tool_id) : (item.tool_id || '—');
        return {
          id: item.id,
          timestamp: item.timestamp,
          action: item.action || '',
          item_name: toolName,
          user_name: userName,
          details: item.details || '',
        };
      });
    } else {
      return filteredVehicleInspections.map(item => {
        const vehicle = item.vehicle_id ? vehicles[item.vehicle_id] : null;
        const user = item.inspected_by ? users[item.inspected_by] : null;
        let userName = 'Unknown';
        if (user) {
          if (user.first_name || user.last_name) {
            userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          } else {
            userName = user.displayName || user.name || user.email?.split('@')[0] || 'Unknown';
          }
        } else if (item.inspected_by) {
          userName = item.inspected_by;
        }
        const vehicleName = vehicle 
          ? (vehicle.registration || vehicle.name || `${vehicle.make} ${vehicle.model}`.trim() || item.vehicle_id)
          : (item.vehicle_id || '—');
        return {
          id: item.id,
          timestamp: item.inspected_at,
          action: item.has_defect ? 'Inspection with Defect' : 'Inspection',
          item_name: vehicleName,
          user_name: userName,
          details: item.notes || (item.has_defect ? 'Defect found' : 'No defects'),
          mileage: item.mileage || '',
        };
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity History</h1>
          <p className="text-white/70 text-sm mt-1">Audit log of all asset and fleet activities</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'assets'
              ? 'border-primary text-primary'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Asset History ({filteredAssetHistory.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'fleet'
              ? 'border-primary text-primary'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Vehicle Inspections ({filteredVehicleInspections.length})
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="text"
            placeholder={activeTab === 'assets' 
              ? "Search by action, asset ID, or user..." 
              : "Search by vehicle, inspector, or defect..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-black border border-primary/30 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
          />
        </div>
        <ExportButton
          data={getCurrentData()}
          filename={activeTab === 'assets' ? 'asset-history' : 'vehicle-inspections'}
          fieldMappings={activeTab === 'assets' ? {
            id: 'ID',
            timestamp: 'Timestamp',
            action: 'Action',
            item_name: 'Asset',
            user_name: 'User',
            details: 'Details',
          } : {
            id: 'ID',
            timestamp: 'Timestamp',
            action: 'Action',
            item_name: 'Vehicle',
            user_name: 'Inspector',
            details: 'Notes',
            mileage: 'Mileage',
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-black border border-primary/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-primary/20 text-white/70 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">{activeTab === 'assets' ? 'Action' : 'Status'}</th>
                <th className="px-6 py-4 font-medium">{activeTab === 'assets' ? 'Asset' : 'Vehicle'}</th>
                <th className="px-6 py-4 font-medium">{activeTab === 'assets' ? 'User' : 'Inspector'}</th>
                {activeTab === 'fleet' && <th className="px-6 py-4 font-medium">Mileage</th>}
                {activeTab === 'fleet' && <th className="px-6 py-4 font-medium">Images</th>}
                <th className="px-6 py-4 font-medium">{activeTab === 'assets' ? 'Details' : 'Notes'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'assets' ? 5 : 7} className="px-6 py-8 text-center text-white/50">
                    Loading history...
                  </td>
                </tr>
              ) : (activeTab === 'assets' ? filteredAssetHistory : filteredVehicleInspections).length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'assets' ? 5 : 7} className="px-6 py-8 text-center text-white/50">
                    No {activeTab === 'assets' ? 'asset history' : 'vehicle inspections'} found.
                  </td>
                </tr>
              ) : activeTab === 'assets' ? (
                filteredAssetHistory.map((item) => {
                  const tool = item.tool_id ? tools[item.tool_id] : null;
                  const user = item.user_id ? users[item.user_id] : null;
                  
                  let userName = '—';
                  if (user) {
                    if (user.first_name || user.last_name) {
                      userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    } else {
                      userName = user.displayName || user.name || user.email?.split('@')[0] || 'Unknown';
                    }
                  } else if (item.user_id) {
                    userName = item.user_id;
                  }
                  
                  const toolName = tool ? (tool.name || `${tool.brand} ${tool.model}`.trim() || item.tool_id) : (item.tool_id || '—');
                  
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/70 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-50" />
                          {formatDate(item.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${item.action?.includes('check_out') ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                            item.action?.includes('check_in') ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-white/10 text-white/60 border border-white/20'}`}
                        >
                          {item.action?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">
                        {toolName}
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        {userName}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {item.details || '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                filteredVehicleInspections.map((item) => {
                  const vehicle = item.vehicle_id ? vehicles[item.vehicle_id] : null;
                  const user = item.inspected_by ? users[item.inspected_by] : null;
                  
                  // Prioritize name display: first_name + last_name > displayName > name > email prefix > id
                  let userName = '—';
                  if (user) {
                    if (user.first_name || user.last_name) {
                      userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    } else if (user.displayName) {
                      userName = user.displayName;
                    } else if (user.name) {
                      userName = user.name;
                    } else if (user.email) {
                      userName = user.email.split('@')[0];
                    } else if (user.id) {
                      userName = user.id;
                    } else {
                      userName = 'Unknown';
                    }
                  } else if (item.inspected_by) {
                    // If user not found, show ID (not email)
                    userName = item.inspected_by;
                  }
                  
                  const vehicleName = vehicle 
                    ? (vehicle.registration || vehicle.name || `${vehicle.make} ${vehicle.model}`.trim() || item.vehicle_id)
                    : (item.vehicle_id || '—');
                  
                  const photoUrls = item.photo_urls ? Object.values(item.photo_urls) : [];
                  const hasImages = photoUrls.length > 0;
                  
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/70 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-50" />
                          {formatDate(item.inspected_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${item.has_defect 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}
                        >
                          {item.has_defect ? 'Defect Found' : 'No Defects'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">
                        {vehicleName}
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        {userName}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {item.mileage ? `${item.mileage.toLocaleString()} mi` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {hasImages ? (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {photoUrls.slice(0, 3).map((url, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setViewingImages(photoUrls);
                                    setCurrentImageIndex(idx);
                                    setViewingImage(url);
                                    setViewingImageAlt(`${vehicleName} - Inspection ${idx + 1}`);
                                  }}
                                  className="w-10 h-10 rounded border border-primary/30 overflow-hidden hover:ring-2 hover:ring-primary transition-all flex-shrink-0"
                                >
                                  <AuthenticatedImage
                                    src={url}
                                    alt={`Inspection image ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                            {photoUrls.length > 3 && (
                              <button
                                onClick={() => {
                                  setViewingImages(photoUrls);
                                  setCurrentImageIndex(0);
                                  setViewingImage(photoUrls[0]);
                                  setViewingImageAlt(`${vehicleName} - All Inspection Images`);
                                }}
                                className="text-xs text-primary hover:text-primary-light hover:underline cursor-pointer"
                              >
                                +{photoUrls.length - 3} more
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/40 text-sm">No images</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {item.notes || (item.has_defect ? 'Defect found' : '—')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={viewingImage !== null}
        onClose={() => {
          setViewingImage(null);
          setViewingImageAlt('');
          setViewingImages([]);
          setCurrentImageIndex(0);
        }}
        imageUrl={viewingImage || ''}
        altText={viewingImageAlt}
        images={viewingImages.length > 0 ? viewingImages : undefined}
        currentIndex={currentImageIndex}
        onIndexChange={(index) => {
          setCurrentImageIndex(index);
          setViewingImage(viewingImages[index]);
        }}
      />
    </div>
  );
}
