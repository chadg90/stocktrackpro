'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Eye, FileDown, Search, Truck, X } from 'lucide-react';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import {
  getCachedCompanyVehicles,
  setCachedCompanyVehicles,
} from '@/lib/companyVehiclesCache';
import AuthenticatedImage from '../components/AuthenticatedImage';
import TableSkeleton from '../components/TableSkeleton';
import { EmptyStateTableRow } from '../components/EmptyState';
import {
  BLOOD_ORGAN_CHECK_LABELS,
  BLOOD_ORGAN_PHOTO_LABELS,
  BLOOD_ORGAN_SECTION_ORDER,
  BLOOD_ORGAN_SECTION_TITLES,
  CAR_VAN_WALKAROUND_LABELS,
  FLUID_STATUS_LABELS,
  FUEL_LEVEL_LABELS,
} from '@/lib/bloodOrganCheckLabels';
import {
  exportVehicleInspectionProofPdf,
  type InspectionProofDoc,
} from '@/lib/vehicleInspectionProofPdf';
import {
  hasEncodedSignature,
  isSignatureStorageRef,
  signatureEncodedToSvgHtml,
} from '@/lib/signaturePaths';
import { getImageUrlFromApp } from '@/lib/getImageUrl';

type Profile = {
  company_id?: string;
  role?: string;
  company_name?: string;
};

type VehicleRow = {
  id: string;
  registration: string;
  make?: string;
  model?: string;
  inspection_category?: string;
};

type InspectionRow = InspectionProofDoc & {
  inspected_at?: Timestamp | string | null;
};

function formatWhen(value?: Timestamp | string | null): string {
  if (!value) return '—';
  try {
    if (value instanceof Timestamp) {
      return value.toDate().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function InspectionProofPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [inspectionsLoading, setInspectionsLoading] = useState(false);
  const [viewInspection, setViewInspection] = useState<InspectionRow | null>(null);
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) {
        setLoading(false);
        return;
      }
      try {
        const profileSnap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
        const data = (profileSnap.data() || {}) as Profile;
        setProfile(data);
        if (!data.company_id) {
          setLoading(false);
          return;
        }

        const companySnap = await getDoc(doc(firebaseDb, 'companies', data.company_id));
        const companyData = companySnap.data() || {};
        setCompanyName((companyData.name as string) || (companyData.company_name as string) || '');

        const cached = getCachedCompanyVehicles<VehicleRow>(data.company_id);
        if (cached) {
          setVehicles(cached);
        } else {
          const vehiclesQuery = query(
            collection(firebaseDb, 'vehicles'),
            where('company_id', '==', data.company_id)
          );
          const vehiclesSnap = await getDocs(vehiclesQuery);
          const list: VehicleRow[] = [];
          vehiclesSnap.forEach((d) => {
            const v = d.data();
            list.push({
              id: d.id,
              registration: String(v.registration || '').toUpperCase(),
              make: v.make,
              model: v.model,
              inspection_category: v.inspection_category,
            });
          });
          list.sort((a, b) => a.registration.localeCompare(b.registration));
          setCachedCompanyVehicles(data.company_id, list);
          setVehicles(list);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load vehicles.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toUpperCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.registration.includes(q) ||
        (v.make || '').toUpperCase().includes(q) ||
        (v.model || '').toUpperCase().includes(q)
    );
  }, [vehicles, vehicleSearch]);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) || null,
    [vehicles, selectedVehicleId]
  );

  useEffect(() => {
    if (!selectedVehicleId || !profile?.company_id || !firebaseDb) {
      setInspections([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setInspectionsLoading(true);
      setError(null);
      try {
        const q = query(
          collection(firebaseDb, 'vehicle_inspections'),
          where('vehicle_id', '==', selectedVehicleId),
          where('company_id', '==', profile.company_id),
          orderBy('inspected_at', 'desc')
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const rows: InspectionRow[] = [];
        snap.forEach((d) => {
          rows.push({ id: d.id, ...(d.data() as Omit<InspectionRow, 'id'>) });
        });
        setInspections(rows);
      } catch (e) {
        console.error(e);
        // Fallback without orderBy if index missing
        try {
          const q2 = query(
            collection(firebaseDb, 'vehicle_inspections'),
            where('vehicle_id', '==', selectedVehicleId),
            where('company_id', '==', profile.company_id)
          );
          const snap2 = await getDocs(q2);
          if (cancelled) return;
          const rows: InspectionRow[] = [];
          snap2.forEach((d) => {
            rows.push({ id: d.id, ...(d.data() as Omit<InspectionRow, 'id'>) });
          });
          rows.sort((a, b) => {
            const da = a.inspected_at instanceof Timestamp ? a.inspected_at.toMillis() : 0;
            const db = b.inspected_at instanceof Timestamp ? b.inspected_at.toMillis() : 0;
            return db - da;
          });
          setInspections(rows);
        } catch (e2) {
          console.error(e2);
          setError('Failed to load inspections for this vehicle.');
        }
      } finally {
        if (!cancelled) setInspectionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedVehicleId, profile?.company_id]);

  const handlePdf = async (inspection: InspectionRow) => {
    if (!selectedVehicle) return;
    setPdfBusyId(inspection.id);
    try {
      await exportVehicleInspectionProofPdf({
        vehicle: selectedVehicle,
        inspection,
        companyName,
      });
    } catch (e) {
      console.error(e);
      setError('PDF generation failed. Please try again.');
    } finally {
      setPdfBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inspection proof</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Select a vehicle registration, then view or download a full PDF of any inspection —
          including photos and checklist results for NHS / compliance requests.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
          Vehicle registration
        </label>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              placeholder="Search registration, make or model"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            value={selectedVehicleId}
            onChange={(e) => {
              setSelectedVehicleId(e.target.value);
              setViewInspection(null);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 md:w-96 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select a vehicle…</option>
            {filteredVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration} — {[v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedVehicle && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <Truck className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {selectedVehicle.registration}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {[selectedVehicle.make, selectedVehicle.model].filter(Boolean).join(' ') || '—'}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Inspector</th>
                  <th className="px-4 py-3">Mileage</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Defects</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inspectionsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6">
                      <TableSkeleton rows={4} cols={6} />
                    </td>
                  </tr>
                ) : inspections.length === 0 ? (
                  <EmptyStateTableRow
                    colSpan={6}
                    message="No inspections found. Complete a vehicle check in the app to generate proof documents here."
                  />
                ) : (
                  inspections.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-100 dark:border-gray-800"
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {formatWhen(row.inspected_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.inspector_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {row.mileage != null ? row.mileage.toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">
                        {row.overall_condition || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {row.has_defect ? (
                          <span className="font-medium text-amber-600 dark:text-amber-400">Yes</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setViewInspection(row)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                          <button
                            type="button"
                            disabled={pdfBusyId === row.id}
                            onClick={() => handlePdf(row)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            {pdfBusyId === row.id ? 'Building…' : 'PDF'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewInspection && selectedVehicle && (
        <InspectionDetailModal
          vehicle={selectedVehicle}
          inspection={viewInspection}
          onClose={() => setViewInspection(null)}
          onPdf={() => handlePdf(viewInspection)}
          pdfBusy={pdfBusyId === viewInspection.id}
        />
      )}
    </div>
  );
}

function InspectionDetailModal({
  vehicle,
  inspection,
  onClose,
  onPdf,
  pdfBusy,
}: {
  vehicle: VehicleRow;
  inspection: InspectionRow;
  onClose: () => void;
  onPdf: () => void;
  pdfBusy: boolean;
}) {
  const isBlood = inspection.inspection_category === 'blood_organ';
  const photos = Object.entries(inspection.photo_urls || {}).filter(([, v]) => !!v);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl dark:bg-gray-900">
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Inspection detail — {vehicle.registration}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatWhen(inspection.inspected_at)} · {inspection.inspector_name || 'Unknown inspector'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPdf}
              disabled={pdfBusy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <FileDown className="h-3.5 w-3.5" />
              {pdfBusy ? 'Building…' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto px-4 py-4">
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <SummaryChip label="Mileage" value={inspection.mileage?.toLocaleString() || '—'} />
              {typeof inspection.recorded_values?.fuel_level === 'number' && (
                <SummaryChip
                  label="Fuel level"
                  value={`${FUEL_LEVEL_LABELS[inspection.recorded_values.fuel_level] || inspection.recorded_values.fuel_level} (${inspection.recorded_values.fuel_level}/5)`}
                />
              )}
              <SummaryChip label="Condition" value={inspection.overall_condition || '—'} />
              <SummaryChip label="Defects" value={inspection.has_defect ? 'Yes' : 'No'} />
              <SummaryChip label="Inspection ID" value={inspection.id.slice(0, 10) + '…'} />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Photos</h3>
            {photos.length === 0 ? (
              <p className="text-sm text-gray-500">No photos.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {photos.map(([key, path]) => (
                  <div key={key} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {BLOOD_ORGAN_PHOTO_LABELS[key] || key}
                    </div>
                    <AuthenticatedImage
                      src={path as string}
                      alt={key}
                      className="h-36 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {isBlood && inspection.check_results ? (
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Checklist results
              </h3>
              {BLOOD_ORGAN_SECTION_ORDER.map((sectionId) => {
                const sectionChecks = Object.entries(BLOOD_ORGAN_CHECK_LABELS).filter(
                  ([checkId, meta]) =>
                    meta.sectionId === sectionId && !!inspection.check_results?.[checkId]
                );
                if (sectionChecks.length === 0) return null;
                return (
                  <div key={sectionId}>
                    <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      {BLOOD_ORGAN_SECTION_TITLES[sectionId]}
                    </h4>
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-xs dark:bg-gray-800">
                          <tr>
                            <th className="px-3 py-2 text-left">Check</th>
                            <th className="px-3 py-2 text-left">Result</th>
                            <th className="px-3 py-2 text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectionChecks.map(([checkId, meta]) => {
                            const r = inspection.check_results?.[checkId] as
                              | {
                                  result?: string;
                                  fluid_status?: string;
                                  reason?: string;
                                  severity?: string;
                                  vehicle_status?: string;
                                  evidence?: { url?: string };
                                }
                              | undefined;
                            const fluidLabel =
                              r?.fluid_status && FLUID_STATUS_LABELS[r.fluid_status];
                            const isYesNo =
                              checkId === 'cab_lockbox_secure' ||
                              checkId === 'cab_lockbox_key_returned';
                            const yesNoLabel =
                              isYesNo && r?.result === 'pass'
                                ? 'Yes'
                                : isYesNo && r?.result === 'fail'
                                  ? 'No'
                                  : isYesNo && r?.result === 'na'
                                    ? 'N/A'
                                    : null;
                            const displayLabel = fluidLabel || yesNoLabel || undefined;
                            return (
                              <tr key={checkId} className="border-t border-gray-100 dark:border-gray-800">
                                <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{meta.title}</td>
                                <td className="px-3 py-2 font-semibold uppercase">
                                  {displayLabel ? (
                                    <ResultBadge result={r?.result} label={displayLabel} />
                                  ) : (
                                    <ResultBadge result={r?.result} />
                                  )}
                                </td>
                                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                  {[
                                    r?.reason,
                                    r?.severity ? `Severity: ${r.severity}` : null,
                                    r?.vehicle_status
                                      ? `Vehicle: ${r.vehicle_status.replace(/_/g, ' ')}`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                                  {r?.evidence?.url ? (
                                    <div className="mt-2 max-w-xs">
                                      <AuthenticatedImage
                                        src={r.evidence.url}
                                        alt="Evidence"
                                        className="h-24 w-full rounded object-cover"
                                      />
                                    </div>
                                  ) : null}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </section>
          ) : inspection.walkaround_declaration?.items ? (
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
                Walkaround checks
              </h3>
              <ul className="space-y-1 text-sm">
                {Object.entries(inspection.walkaround_declaration.items).map(([id, ok]) => (
                  <li key={id} className="flex justify-between rounded border border-gray-100 px-3 py-2 dark:border-gray-800">
                    <span>{CAR_VAN_WALKAROUND_LABELS[id] || id}</span>
                    <span className={ok ? 'font-semibold text-green-600' : 'text-gray-400'}>
                      {ok ? 'Confirmed' : 'Not confirmed'}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {inspection.has_defect && (
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Defects</h3>
              {Array.isArray(inspection.defects) && inspection.defects.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {inspection.defects.map((d, i) => (
                    <li key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/40">
                      <div className="font-semibold capitalize">
                        {d.defect_type} · {d.defect_severity}
                      </div>
                      <div>{d.defect_description}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950/40">
                  <div className="font-semibold capitalize">
                    {inspection.defect_type} · {inspection.defect_severity}
                  </div>
                  <div>{inspection.defect_description}</div>
                </div>
              )}
            </section>
          )}

          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
              Declaration
            </h3>
            {isBlood && inspection.declaration ? (
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="space-y-1">
                  <p>
                    Physically completed checks:{' '}
                    <strong>{inspection.declaration.items?.decl_physical ? 'Yes' : 'No'}</strong>
                  </p>
                  <p>
                    Faults reported accurately:{' '}
                    <strong>{inspection.declaration.items?.decl_accurate ? 'Yes' : 'No'}</strong>
                  </p>
                  <p>Signed at: {inspection.declaration.confirmed_at || '—'}</p>
                </div>
                <InspectionSignaturePreview signaturePaths={inspection.declaration.signature_paths} />
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {inspection.walkaround_declaration?.items?.final_confirm
                  ? 'Walkaround declaration confirmed.'
                  : 'No declaration recorded.'}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold capitalize text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function ResultBadge({ result, label }: { result?: string; label?: string }) {
  const r = (result || '—').toLowerCase();
  const cls =
    r === 'pass'
      ? 'text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-950'
      : r === 'fail'
        ? 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950'
        : r === 'na'
          ? 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
          : 'text-gray-500';
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${cls} ${label ? 'normal-case' : ''}`}>
      {label || r}
    </span>
  );
}

function InspectionSignaturePreview({ signaturePaths }: { signaturePaths?: string }) {
  const [storageUrl, setStorageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStorageUrl(null);
    if (!signaturePaths || !isSignatureStorageRef(signaturePaths)) return;
    (async () => {
      const url = await getImageUrlFromApp(signaturePaths);
      if (!cancelled) setStorageUrl(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [signaturePaths]);

  const svg = hasEncodedSignature(signaturePaths)
    ? signatureEncodedToSvgHtml(signaturePaths, { width: 280, height: 100 })
    : null;

  if (svg) {
    return (
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Inspector signature
        </div>
        <div
          className="inline-block rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    );
  }

  if (storageUrl) {
    return (
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Inspector signature
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={storageUrl}
          alt="Inspector signature"
          className="max-h-24 max-w-xs rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700"
        />
      </div>
    );
  }

  return (
    <p className="text-xs text-gray-500">
      {signaturePaths ? 'Signature on file.' : 'No signature recorded.'}
    </p>
  );
}
