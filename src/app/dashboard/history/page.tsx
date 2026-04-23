'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Clock, Search, Truck } from 'lucide-react';
import ExportButton from '../components/ExportButton';
import ImageViewerModal from '../components/ImageViewerModal';
import AuthenticatedImage from '../components/AuthenticatedImage';
import LazyWhenVisible from '../components/LazyWhenVisible';
import { EmptyStateTableRow } from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import TablePagination from '../components/TablePagination';
import {
  HISTORY_PAGE_SIZE,
  historyQueryKeys,
  fetchVehicleInspectionsHistoryPage,
  type VehicleInspectionRow,
  type HistoryPagePayload,
} from '@/lib/historyFirestore';
import { DVSA_HISTORY_MONTHS } from '@/lib/dvsaRetention';
import type { Timestamp } from 'firebase/firestore';

type Profile = {
  id: string;
  company_id?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  displayName?: string;
  name?: string;
  email?: string;
};

type Vehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
  name?: string;
};

type Mappings = {
  vehicles: Record<string, Vehicle>;
  users: Record<string, Profile>;
};

const formatDate = (value?: string | Timestamp) => {
  if (!value) return '—';
  try {
    if (value && typeof value === 'object' && 'toDate' in value) {
      return (value as Timestamp).toDate().toLocaleString();
    }
    return new Date(value as string).toLocaleString();
  } catch {
    return typeof value === 'string' ? value : '—';
  }
};

async function fetchMappings(companyId: string): Promise<Mappings> {
  if (!firebaseDb) throw new Error('Firebase not configured');
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const vehiclesQ = query(collection(firebaseDb, 'vehicles'), where('company_id', '==', companyId));
  const usersQ = query(collection(firebaseDb, 'profiles'), where('company_id', '==', companyId));
  const [vehiclesSnap, usersSnap] = await Promise.all([getDocs(vehiclesQ), getDocs(usersQ)]);

  const vehicles: Record<string, Vehicle> = {};
  vehiclesSnap.docs.forEach((d) => {
    vehicles[d.id] = { id: d.id, ...d.data() } as Vehicle;
  });
  const users: Record<string, Profile> = {};
  usersSnap.docs.forEach((d) => {
    users[d.id] = { id: d.id, ...d.data() } as Profile;
  });

  return { vehicles, users };
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [bootstrapping, setBootstrapping] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fleetPage, setFleetPage] = useState(1);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageAlt, setViewingImageAlt] = useState('');
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) {
      setBootstrapping(false);
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setCompanyId(null);
        setBootstrapping(false);
        return;
      }
      try {
        const profileRef = doc(firebaseDb!, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setCompanyId(data.company_id ?? null);
        } else {
          setCompanyId(null);
        }
      } catch {
        setCompanyId(null);
      } finally {
        setBootstrapping(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    setFleetPage(1);
  }, [companyId, searchTerm]);

  const mappingsQuery = useQuery({
    queryKey: historyQueryKeys.mappings(companyId ?? ''),
    queryFn: () => fetchMappings(companyId!),
    enabled: Boolean(firebaseDb && companyId),
    staleTime: 10 * 60 * 1000,
  });

  const fleetPageEnabled =
    Boolean(firebaseDb && companyId) &&
    (fleetPage === 1 ||
      Boolean(
        queryClient.getQueryData<HistoryPagePayload<VehicleInspectionRow>>(
          historyQueryKeys.fleet(companyId!, fleetPage - 1)
        )
      ));

  const fleetQuery = useQuery({
    queryKey: historyQueryKeys.fleet(companyId ?? '', fleetPage),
    queryFn: async () => {
      const prev =
        fleetPage > 1
          ? queryClient.getQueryData<HistoryPagePayload<VehicleInspectionRow>>(
              historyQueryKeys.fleet(companyId!, fleetPage - 1)
            )
          : undefined;
      return fetchVehicleInspectionsHistoryPage(firebaseDb!, companyId!, fleetPage, prev);
    },
    enabled: fleetPageEnabled,
  });

  const vehicles = mappingsQuery.data?.vehicles ?? {};
  const users = mappingsQuery.data?.users ?? {};

  const filteredVehicleInspections = useMemo(() => {
    const rows = fleetQuery.data?.items ?? [];
    const q = searchTerm.toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.vehicle_id?.toLowerCase().includes(q) ||
        item.inspected_by?.toLowerCase().includes(q) ||
        (item.has_defect && 'defect'.includes(q))
    );
  }, [fleetQuery.data?.items, searchTerm]);

  const tableLoading = bootstrapping || mappingsQuery.isPending || fleetQuery.isPending;
  const serverHasMoreFleet = fleetQuery.data?.hasMore ?? false;

  const exportData = filteredVehicleInspections.map((item) => {
    const vehicle = item.vehicle_id ? vehicles[item.vehicle_id] : null;
    const user = item.inspected_by ? users[item.inspected_by] : null;
    let userName = 'Unknown';
    if (user) {
      if (user.first_name || user.last_name) {
        userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      } else if (user.display_name) {
        userName = user.display_name.trim();
      } else {
        userName = user.displayName || user.name || user.email?.split('@')[0] || 'Unknown';
      }
    } else if (item.inspected_by) {
      userName = item.inspected_by;
    }
    const vehicleName = vehicle
      ? vehicle.registration || vehicle.name || `${vehicle.make} ${vehicle.model}`.trim() || item.vehicle_id
      : item.vehicle_id || '—';

    return {
      id: item.id,
      timestamp: item.inspected_at,
      status: item.has_defect ? 'Defect Found' : 'No Defects',
      vehicle: vehicleName,
      inspector: userName,
      mileage: item.mileage || '',
      notes: item.notes || (item.has_defect ? 'Defect found' : ''),
    };
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity History</h1>
          <p className="text-white/70 text-sm mt-1">
            Fleet inspection audit log (last {DVSA_HISTORY_MONTHS} months, {HISTORY_PAGE_SIZE} rows per
            page). Thumbnails load as you scroll.
          </p>
        </div>
      </div>

      <div className="mb-6 border-b border-white/10">
        <div className="px-4 py-2 font-medium text-sm border-b-2 border-blue-500 text-blue-500 inline-flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Fleet Inspections
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="text"
            placeholder="Search by vehicle, inspector, or defect status (current page)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-black border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
          />
        </div>
        <ExportButton
          data={exportData}
          filename="fleet-inspections"
          fieldMappings={{
            id: 'ID',
            timestamp: 'Timestamp',
            status: 'Status',
            vehicle: 'Vehicle',
            inspector: 'Inspector',
            mileage: 'Mileage',
            notes: 'Notes',
          }}
        />
      </div>
      <p className="text-white/40 text-xs -mt-4 mb-6">
        Search only filters the rows on the current page. Export includes the current page only.
      </p>

      {(fleetQuery.isError || mappingsQuery.isError) && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
          Some data could not be loaded. If this persists, deploy the Firestore composite indexes (see
          firestore.indexes.json in the project) or check the browser console.
        </div>
      )}

      <div className="bg-black border border-blue-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-blue-500/20 text-white/70 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Vehicle</th>
                <th className="px-6 py-4 font-medium">Inspector</th>
                <th className="px-6 py-4 font-medium">Mileage</th>
                <th className="px-6 py-4 font-medium">Images</th>
                <th className="px-6 py-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {tableLoading ? (
                <TableSkeleton cols={7} />
              ) : filteredVehicleInspections.length === 0 ? (
                <EmptyStateTableRow colSpan={7} message="No fleet inspection history found." />
              ) : (
                filteredVehicleInspections.map((item) => {
                  const vehicle = item.vehicle_id ? vehicles[item.vehicle_id] : null;
                  const user = item.inspected_by ? users[item.inspected_by] : null;
                  let userName = '—';
                  if (user) {
                    if (user.first_name || user.last_name) {
                      userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    } else if (user.display_name) {
                      userName = user.display_name.trim();
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
                    userName = item.inspected_by;
                  }

                  const vehicleName = vehicle
                    ? vehicle.registration ||
                      vehicle.name ||
                      `${vehicle.make} ${vehicle.model}`.trim() ||
                      item.vehicle_id
                    : item.vehicle_id || '—';

                  const photoUrls = item.photo_urls ? Object.values(item.photo_urls) : [];
                  const hasImages = photoUrls.length > 0;
                  const thumbSlots = photoUrls.slice(0, 3);
                  const extraCount = photoUrls.length - thumbSlots.length;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/70 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-50" />
                          {formatDate(item.inspected_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.has_defect
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}
                        >
                          {item.has_defect ? 'Defect Found' : 'No Defects'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">{vehicleName}</td>
                      <td className="px-6 py-4 text-white/80 text-sm">{userName}</td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {item.mileage ? `${item.mileage.toLocaleString()} mi` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {hasImages ? (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {thumbSlots.map((url, idx) => (
                                <LazyWhenVisible
                                  key={`${item.id}-${idx}`}
                                  className="inline-block"
                                  placeholder={
                                    <div className="w-10 h-10 rounded border border-blue-500/20 bg-white/10 animate-pulse" />
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setViewingImages(photoUrls);
                                      setCurrentImageIndex(idx);
                                      setViewingImage(url);
                                      setViewingImageAlt(`${vehicleName} - Inspection ${idx + 1}`);
                                    }}
                                    className="w-10 h-10 rounded border border-blue-500/30 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all flex-shrink-0"
                                  >
                                    <AuthenticatedImage
                                      src={url}
                                      alt={`Inspection image ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      preferThumbnail
                                    />
                                  </button>
                                </LazyWhenVisible>
                              ))}
                            </div>
                            {extraCount > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingImages(photoUrls);
                                  setCurrentImageIndex(0);
                                  setViewingImage(photoUrls[0] || null);
                                  setViewingImageAlt(`${vehicleName} - All Inspection Images`);
                                }}
                                className="text-xs text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
                              >
                                +{extraCount} more
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
        <TablePagination
          variant="cursor"
          currentPage={fleetPage}
          pageSize={HISTORY_PAGE_SIZE}
          itemsOnCurrentPage={filteredVehicleInspections.length}
          hasNextPage={serverHasMoreFleet}
          onPageChange={setFleetPage}
        />
      </div>

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
          setViewingImage(viewingImages[index] ?? null);
        }}
      />
    </div>
  );
}
