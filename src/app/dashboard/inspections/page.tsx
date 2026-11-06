'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';
import { Clock, Search, Truck } from 'lucide-react';
import { useFleetReport } from '../fleet-report/FleetReportContext';
import FleetReportPeriodControls from '../fleet-report/FleetReportPeriodControls';
import ExportButton from '../components/ExportButton';
import ImageViewerModal from '../components/ImageViewerModal';
import AuthenticatedImage from '../components/AuthenticatedImage';
import LazyWhenVisible from '../components/LazyWhenVisible';
import { EmptyStateTableRow } from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import TablePagination, { PAGE_SIZE } from '../components/TablePagination';
import PageGuideButton from '../components/PageGuide';
import {
  filterInspectionsInWeek,
  formatCompliancePeriodRange,
  getCompliancePeriodBounds,
  type CompliancePeriodPreset,
  type FleetInspection,
} from '@/lib/fleetReportLogic';

function inspectedAtMs(value?: Timestamp | string | null): number {
  if (!value) return 0;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().getTime();
  }
  const t = new Date(value as string).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function formatDashboardDate(value?: Timestamp | string | null): string {
  if (!value) return '—';
  try {
    const d =
      typeof value === 'object' && value !== null && 'toDate' in value
        ? (value as Timestamp).toDate()
        : new Date(value as string);
    if (Number.isNaN(d.getTime())) return '—';
    return format(d, 'dd/MM/yyyy HH:mm');
  } catch {
    return '—';
  }
}

type InspectionVehicleFields = {
  registration?: string;
  vehicle_registration?: string;
  vehicle_reg?: string;
};

function displayRegistration(
  vehicle: { registration?: string; name?: string; make?: string; model?: string } | null | undefined,
  vehicleId?: string,
  inspection?: InspectionVehicleFields | null
): string {
  if (vehicle?.registration?.trim()) return vehicle.registration.trim();
  if (vehicle?.name?.trim()) return vehicle.name.trim();
  const makeModel = `${vehicle?.make ?? ''} ${vehicle?.model ?? ''}`.trim();
  if (makeModel) return makeModel;
  const fromInspection =
    inspection?.registration?.trim() ||
    inspection?.vehicle_registration?.trim() ||
    inspection?.vehicle_reg?.trim();
  if (fromInspection) return fromInspection;
  if (vehicleId) return 'Vehicle removed';
  return 'No registration';
}

function inspectorName(
  users: Record<
    string,
    {
      first_name?: string;
      last_name?: string;
      display_name?: string;
      displayName?: string;
      name?: string;
      email?: string;
    }
  >,
  inspectedBy?: string
): string {
  if (!inspectedBy) return 'Unknown user';
  const user = users[inspectedBy];
  if (!user) return 'Unknown user';
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  if (user.display_name?.trim()) return user.display_name.trim();
  if (user.displayName?.trim()) return user.displayName.trim();
  if (user.name?.trim()) return user.name.trim();
  if (user.email) return user.email.split('@')[0] || 'Unknown user';
  return 'Unknown user';
}

export default function InspectionsPage() {
  const { loading, historyLoading, inspections, vehicles, users } = useFleetReport();
  const [period, setPeriod] = useState<CompliancePeriodPreset>('week');
  const [monthValue, setMonthValue] = useState(() => format(new Date(), 'yyyy-MM'));
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageAlt, setViewingImageAlt] = useState('');
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const periodBounds = useMemo(
    () => getCompliancePeriodBounds(period, monthValue),
    [period, monthValue]
  );

  const periodInspections = useMemo(() => {
    const rows = filterInspectionsInWeek(inspections, periodBounds.start, periodBounds.end);
    return [...rows].sort((a, b) => inspectedAtMs(b.inspected_at) - inspectedAtMs(a.inspected_at));
  }, [inspections, periodBounds.start, periodBounds.end]);

  const vehicleMap = useMemo(() => {
    const map: Record<string, (typeof vehicles)[number]> = {};
    vehicles.forEach((v) => {
      map[v.id] = v;
    });
    return map;
  }, [vehicles]);

  const userMap = useMemo(() => {
    const map: Record<string, (typeof users)[number]> = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return periodInspections;
    return periodInspections.filter((item) => {
      const vehicle = item.vehicle_id ? vehicleMap[item.vehicle_id] : null;
      const reg = displayRegistration(
        vehicle,
        item.vehicle_id,
        item as FleetInspection & InspectionVehicleFields
      ).toLowerCase();
      const inspector = inspectorName(userMap, item.inspected_by).toLowerCase();
      const status = item.has_defect ? 'defect' : 'no defects';
      return (
        reg.includes(q) ||
        inspector.includes(q) ||
        status.includes(q) ||
        (item.notes || '').toLowerCase().includes(q)
      );
    });
  }, [periodInspections, searchTerm, vehicleMap, userMap]);

  useEffect(() => {
    setPage(1);
  }, [period, monthValue, searchTerm]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportData = filtered.map((item) => {
    const vehicle = item.vehicle_id ? vehicleMap[item.vehicle_id] : null;
    return {
      id: item.id,
      timestamp: formatDashboardDate(item.inspected_at),
      status: item.has_defect ? 'Defect Found' : 'No Defects',
      vehicle: displayRegistration(
        vehicle,
        item.vehicle_id,
        item as FleetInspection & InspectionVehicleFields
      ),
      inspector: inspectorName(userMap, item.inspected_by),
      mileage: item.mileage ?? '',
      notes: item.notes || (item.has_defect ? 'Defect found' : ''),
    };
  });

  const tableLoading = loading;
  const periodLabel = formatCompliancePeriodRange(periodBounds, period);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Inspections</h1>
            <PageGuideButton pageId="history" />
          </div>
          <p className="text-white/70 text-sm mt-1">
            Fleet inspection records for {periodLabel}. Search and Export cover every result in the chosen period.
            {historyLoading ? ' Loading older history…' : ''}
          </p>
        </div>
        <FleetReportPeriodControls
          period={period}
          monthValue={monthValue}
          onPeriodChange={setPeriod}
          onMonthChange={setMonthValue}
        />
      </div>

      <div className="mb-6 border-b border-white/10">
        <div className="px-4 py-2 font-medium text-sm border-b-2 border-blue-500 text-blue-500 inline-flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Fleet inspections
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1" data-tour="history-search">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/30" />
          </div>
          <input
            type="text"
            placeholder="Search by registration, inspector, or defect status…"
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

      {/* Mobile cards (<640px) */}
      <div className="sm:hidden space-y-3" data-tour="history-table">
        {tableLoading ? (
          <div className="bg-black border border-blue-500/20 rounded-xl p-4 text-white/60 text-sm">Loading…</div>
        ) : pageRows.length === 0 ? (
          <div className="bg-black border border-blue-500/20 rounded-xl p-4 text-white/60 text-sm">
            No fleet inspections in this period.
          </div>
        ) : (
          pageRows.map((item: FleetInspection) => {
            const vehicle = item.vehicle_id ? vehicleMap[item.vehicle_id] : null;
            const vehicleName = displayRegistration(
              vehicle,
              item.vehicle_id,
              item as FleetInspection & InspectionVehicleFields
            );
            return (
              <div key={item.id} className="bg-black border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-white font-medium min-w-0 truncate">{vehicleName}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                      item.has_defect
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}
                  >
                    {item.has_defect ? 'Defect Found' : 'No Defects'}
                  </span>
                </div>
                <p className="text-white/70 text-sm mt-2 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 opacity-50" />
                  {formatDashboardDate(item.inspected_at)}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {item.mileage ? `${item.mileage.toLocaleString('en-GB')} mi` : '—'}
                </p>
              </div>
            );
          })
        )}
        <TablePagination
          currentPage={safePage}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-black border border-blue-500/20 rounded-xl overflow-hidden" data-tour="history-table">
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
              ) : pageRows.length === 0 ? (
                <EmptyStateTableRow colSpan={7} message="No fleet inspections in this period." />
              ) : (
                pageRows.map((item: FleetInspection) => {
                  const vehicle = item.vehicle_id ? vehicleMap[item.vehicle_id] : null;
                  const vehicleName = displayRegistration(
                    vehicle,
                    item.vehicle_id,
                    item as FleetInspection & InspectionVehicleFields
                  );
                  const userName = inspectorName(userMap, item.inspected_by);
                  const photoUrls = item.photo_urls
                    ? Object.values(item.photo_urls).filter((u): u is string => Boolean(u))
                    : [];
                  const hasImages = photoUrls.length > 0;
                  const thumbSlots = photoUrls.slice(0, 3);
                  const extraCount = photoUrls.length - thumbSlots.length;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/70 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-50" />
                          {formatDashboardDate(item.inspected_at)}
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
                        {item.mileage ? `${item.mileage.toLocaleString('en-GB')} mi` : '—'}
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
          currentPage={safePage}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
          onPageChange={setPage}
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
