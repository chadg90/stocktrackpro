'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import {
  deleteObject,
  getBytes,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import JSZip from 'jszip';
import {
  Download,
  FileText,
  Search,
  Trash2,
  Truck,
  Upload,
} from 'lucide-react';
import { firebaseApp, firebaseAuth, firebaseDb } from '@/lib/firebase';
import {
  getCachedCompanyVehicles,
  setCachedCompanyVehicles,
} from '@/lib/companyVehiclesCache';
import TableSkeleton from '../components/TableSkeleton';
import { EmptyStateTableRow } from '../components/EmptyState';
import {
  buildVehiclePeriodReportPdf,
  getPeriodBounds,
  type PeriodMonths,
  type VehiclePeriodDefect,
  type VehiclePeriodDocument,
  type VehiclePeriodInspection,
} from '@/lib/vehiclePeriodReportPdf';
import { trackFeatureClick } from '@/lib/productUsage';

type Profile = {
  company_id?: string;
  role?: string;
  company_name?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type VehicleRow = {
  id: string;
  registration: string;
  make?: string;
  model?: string;
  mileage?: number | null;
  mot_expiry_date?: Timestamp | string | null;
  tax_expiry_date?: Timestamp | string | null;
  mot_status?: string;
  tax_status?: string;
};

type DocType = 'mot' | 'service' | 'other';

type DocumentRow = VehiclePeriodDocument & {
  uploaded_by_name?: string;
  uploaded_at?: Timestamp | string | null;
};

const DOC_TYPE_LABELS: Record<DocType, string> = {
  mot: 'MOT',
  service: 'Service history',
  other: 'Other',
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

function formatDateOnly(value?: Timestamp | string | Date | null): string {
  if (!value) return '—';
  try {
    const d = value instanceof Timestamp ? value.toDate() : new Date(value);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function toMillis(value?: Timestamp | string | Date | null): number {
  if (!value) return 0;
  if (value instanceof Timestamp) return value.toMillis();
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function inRange(
  value: Timestamp | string | Date | null | undefined,
  start: Date,
  end: Date
): boolean {
  const ms = toMillis(value);
  if (!ms) return false;
  return ms >= start.getTime() && ms <= end.getTime();
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

export default function VehicleReportsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [packBusyMonths, setPackBusyMonths] = useState<PeriodMonths | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [uploadType, setUploadType] = useState<DocType>('mot');
  const [uploadDate, setUploadDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) || null,
    [vehicles, selectedVehicleId]
  );

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    const list = [...vehicles].sort((a, b) =>
      (a.registration || '').localeCompare(b.registration || '')
    );
    if (!q) return list;
    return list.filter((v) => {
      const hay = `${v.registration || ''} ${v.make || ''} ${v.model || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [vehicles, vehicleSearch]);

  const docsLast6 = useMemo(() => {
    const { start, end } = getPeriodBounds(6);
    return documents.filter((d) => inRange(d.document_date as Timestamp | null, start, end));
  }, [documents]);

  const docsLast12 = useMemo(() => {
    const { start, end } = getPeriodBounds(12);
    return documents.filter((d) => inRange(d.document_date as Timestamp | null, start, end));
  }, [documents]);

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
        setCompanyName(
          (companyData.name as string) ||
            (companyData.company_name as string) ||
            data.company_name ||
            ''
        );

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
              registration: (v.registration as string) || 'UNKNOWN',
              make: v.make as string | undefined,
              model: v.model as string | undefined,
              mileage: (v.mileage as number) ?? null,
              mot_expiry_date: (v.mot_expiry_date as Timestamp) || null,
              tax_expiry_date: (v.tax_expiry_date as Timestamp) || null,
              mot_status: v.mot_status as string | undefined,
              tax_status: v.tax_status as string | undefined,
            });
          });
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

  const loadDocuments = useCallback(async (vehicleId: string, companyId: string) => {
    if (!firebaseDb) return;
    setDocsLoading(true);
    try {
      const q = query(
        collection(firebaseDb, 'vehicle_documents'),
        where('company_id', '==', companyId),
        where('vehicle_id', '==', vehicleId),
        orderBy('document_date', 'desc')
      );
      const snap = await getDocs(q);
      const rows: DocumentRow[] = [];
      snap.forEach((d) => {
        rows.push({ id: d.id, ...(d.data() as Omit<DocumentRow, 'id'>) });
      });
      setDocuments(rows);
    } catch (e) {
      console.error(e);
      try {
        const q2 = query(
          collection(firebaseDb!, 'vehicle_documents'),
          where('company_id', '==', companyId),
          where('vehicle_id', '==', vehicleId)
        );
        const snap2 = await getDocs(q2);
        const rows: DocumentRow[] = [];
        snap2.forEach((d) => {
          rows.push({ id: d.id, ...(d.data() as Omit<DocumentRow, 'id'>) });
        });
        rows.sort(
          (a, b) =>
            toMillis(b.document_date as Timestamp | null) -
            toMillis(a.document_date as Timestamp | null)
        );
        setDocuments(rows);
      } catch (e2) {
        console.error(e2);
        setError('Failed to load vehicle documents. Deploy Firestore rules/indexes if this persists.');
        setDocuments([]);
      }
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedVehicleId || !profile?.company_id) {
      setDocuments([]);
      return;
    }
    loadDocuments(selectedVehicleId, profile.company_id);
  }, [selectedVehicleId, profile?.company_id, loadDocuments]);

  const uploaderName = useMemo(() => {
    if (!profile) return 'Manager';
    if (profile.name) return profile.name;
    const full = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    if (full) return full;
    return profile.email?.split('@')[0] || 'Manager';
  }, [profile]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!firebaseDb || !firebaseApp || !firebaseAuth?.currentUser || !profile?.company_id || !selectedVehicle) {
      setError('Not ready to upload. Please sign in again.');
      return;
    }
    if (!uploadFile) {
      setError('Choose a PDF or image file to upload.');
      return;
    }
    if (
      !ALLOWED_TYPES.includes(uploadFile.type) &&
      !uploadFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Only PDF or image files (JPEG/PNG/WebP) are allowed.');
      return;
    }
    if (uploadFile.size > MAX_FILE_BYTES) {
      setError('File must be 10MB or smaller.');
      return;
    }
    if (!uploadDate) {
      setError('Document date is required.');
      return;
    }

    setUploading(true);
    try {
      const docRef = doc(collection(firebaseDb, 'vehicle_documents'));
      const fileName = safeFileName(uploadFile.name);
      const storagePath = `vehicle-documents/${profile.company_id}/${selectedVehicle.id}/${docRef.id}/${fileName}`;
      const storage = getStorage(firebaseApp);
      await uploadBytes(ref(storage, storagePath), uploadFile, {
        contentType: uploadFile.type || 'application/octet-stream',
      });

      const contentType =
        uploadFile.type ||
        (fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      const title =
        uploadTitle.trim() ||
        `${DOC_TYPE_LABELS[uploadType]} — ${selectedVehicle.registration}`;

      await setDoc(docRef, {
        company_id: profile.company_id,
        vehicle_id: selectedVehicle.id,
        type: uploadType,
        title,
        document_date: Timestamp.fromDate(new Date(`${uploadDate}T12:00:00`)),
        storage_path: storagePath,
        file_name: uploadFile.name,
        content_type: contentType,
        notes: uploadNotes.trim() || null,
        uploaded_by: firebaseAuth.currentUser.uid,
        uploaded_by_name: uploaderName,
        uploaded_at: serverTimestamp(),
      });

      setSuccess('Document uploaded.');
      setUploadFile(null);
      setUploadNotes('');
      setUploadTitle('');
      await loadDocuments(selectedVehicle.id, profile.company_id);
    } catch (err) {
      console.error(err);
      setError(
        'Upload failed. If this is the first time, deploy Storage and Firestore rules for vehicle documents.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (row: DocumentRow) => {
    if (!firebaseDb || !firebaseApp || !profile?.company_id || !selectedVehicle) return;
    if (!window.confirm(`Delete “${row.title || row.file_name || 'document'}”?`)) return;
    setDeletingId(row.id);
    setError(null);
    try {
      if (row.storage_path) {
        try {
          await deleteObject(ref(getStorage(firebaseApp), row.storage_path));
        } catch (storageErr) {
          console.warn('Storage delete skipped:', storageErr);
        }
      }
      await deleteDoc(doc(firebaseDb, 'vehicle_documents', row.id));
      setDocuments((prev) => prev.filter((d) => d.id !== row.id));
      setSuccess('Document deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const openDocument = async (row: DocumentRow) => {
    if (!firebaseApp || !row.storage_path) return;
    try {
      const url = await getDownloadURL(ref(getStorage(firebaseApp), row.storage_path));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      setError('Could not open document.');
    }
  };

  const handleDownloadPack = async (months: PeriodMonths) => {
    if (!firebaseApp || !firebaseDb || !profile?.company_id || !selectedVehicle) return;
    setPackBusyMonths(months);
    setError(null);
    setSuccess(null);
    try {
      const { start, end } = getPeriodBounds(months);
      const periodDocs = documents.filter((d) =>
        inRange(d.document_date as Timestamp | null, start, end)
      );

      const inspections: VehiclePeriodInspection[] = [];
      try {
        const iq = query(
          collection(firebaseDb, 'vehicle_inspections'),
          where('company_id', '==', profile.company_id),
          where('vehicle_id', '==', selectedVehicle.id),
          orderBy('inspected_at', 'desc')
        );
        const isnap = await getDocs(iq);
        isnap.forEach((d) => {
          const data = d.data();
          if (inRange(data.inspected_at as Timestamp, start, end)) {
            inspections.push({ id: d.id, ...(data as Omit<VehiclePeriodInspection, 'id'>) });
          }
        });
      } catch {
        const iq2 = query(
          collection(firebaseDb, 'vehicle_inspections'),
          where('company_id', '==', profile.company_id),
          where('vehicle_id', '==', selectedVehicle.id)
        );
        const isnap2 = await getDocs(iq2);
        isnap2.forEach((d) => {
          const data = d.data();
          if (inRange(data.inspected_at as Timestamp, start, end)) {
            inspections.push({ id: d.id, ...(data as Omit<VehiclePeriodInspection, 'id'>) });
          }
        });
        inspections.sort(
          (a, b) => toMillis(b.inspected_at as Timestamp) - toMillis(a.inspected_at as Timestamp)
        );
      }

      const defects: VehiclePeriodDefect[] = [];
      try {
        const dq = query(
          collection(firebaseDb, 'vehicle_defects'),
          where('company_id', '==', profile.company_id),
          where('vehicle_id', '==', selectedVehicle.id),
          orderBy('reported_at', 'desc')
        );
        const dsnap = await getDocs(dq);
        dsnap.forEach((d) => {
          const data = d.data();
          if (inRange(data.reported_at as Timestamp, start, end)) {
            defects.push({ id: d.id, ...(data as Omit<VehiclePeriodDefect, 'id'>) });
          }
        });
      } catch {
        const dq2 = query(
          collection(firebaseDb, 'vehicle_defects'),
          where('company_id', '==', profile.company_id),
          where('vehicle_id', '==', selectedVehicle.id)
        );
        const dsnap2 = await getDocs(dq2);
        dsnap2.forEach((d) => {
          const data = d.data();
          if (inRange(data.reported_at as Timestamp, start, end)) {
            defects.push({ id: d.id, ...(data as Omit<VehiclePeriodDefect, 'id'>) });
          }
        });
        defects.sort(
          (a, b) => toMillis(b.reported_at as Timestamp) - toMillis(a.reported_at as Timestamp)
        );
      }

      const { blob: reportBlob, fileName: reportName } = await buildVehiclePeriodReportPdf({
        vehicle: selectedVehicle,
        companyName,
        months,
        inspections,
        defects,
        documents: periodDocs,
      });

      const zip = new JSZip();
      zip.file(reportName, reportBlob);

      const storage = getStorage(firebaseApp);
      const docsFolder = zip.folder('documents');
      const usedNames = new Set<string>();

      for (const row of periodDocs) {
        if (!row.storage_path || !docsFolder) continue;
        try {
          const bytes = await getBytes(ref(storage, row.storage_path));
          const datePart = formatDateOnly(row.document_date as Timestamp).replace(/\s+/g, '-');
          const typePart = String(row.type || 'other');
          const base = safeFileName(
            `${datePart}_${typePart}_${row.file_name || row.title || row.id || 'document'}`
          );
          let name = base;
          let n = 2;
          while (usedNames.has(name.toLowerCase())) {
            const dot = base.lastIndexOf('.');
            name =
              dot > 0
                ? `${base.slice(0, dot)}_${n}${base.slice(dot)}`
                : `${base}_${n}`;
            n += 1;
          }
          usedNames.add(name.toLowerCase());
          docsFolder.file(name, bytes);
        } catch (docErr) {
          console.warn('Pack document skip:', row.id, docErr);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const safeReg = (selectedVehicle.registration || 'vehicle')
        .toUpperCase()
        .replace(/[^a-zA-Z0-9_-]/g, '');
      const zipName = `FTP-${safeReg}-${months}month-pack.zip`;
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipName;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      void trackFeatureClick(months === 6 ? 'vehicle_pack_6m' : 'vehicle_pack_12m');
      setSuccess(
        `${months}-month pack ready (${periodDocs.length} document${
          periodDocs.length === 1 ? '' : 's'
        } included). Share the ZIP with NHS as needed.`
      );
    } catch (err) {
      console.error(err);
      setError('Pack download failed. Please try again.');
    } finally {
      setPackBusyMonths(null);
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
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle reports</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Upload MOT, service history and other documents for a vehicle, then download a 6- or
          12-month pack (summary PDF plus original files) for NHS or other operators.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
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
              setSuccess(null);
              setError(null);
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
        <>
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

            <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Upload document
              </h2>
              <form
                onSubmit={handleUpload}
                className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2"
              >
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </span>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as DocType)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="mot">MOT</option>
                    <option value="service">Service history</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    Document date
                  </span>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </label>
                <label className="text-sm md:col-span-2">
                  <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    Title (optional)
                  </span>
                  <input
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Annual service — Main Street Garage"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </label>
                <label className="text-sm md:col-span-2">
                  <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    Notes (optional)
                  </span>
                  <input
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </label>
                <label className="text-sm md:col-span-2">
                  <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    File (PDF or image, max 10MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white file:keep-light-on-dark hover:file:bg-blue-600 dark:text-gray-300"
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white keep-light-on-dark hover:bg-blue-600 disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4 text-white keep-light-on-dark" />
                    {uploading ? 'Uploading…' : 'Upload document'}
                  </button>
                </div>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6">
                        <TableSkeleton rows={3} cols={5} />
                      </td>
                    </tr>
                  ) : documents.length === 0 ? (
                    <EmptyStateTableRow
                      colSpan={5}
                      message="No documents uploaded yet for this vehicle."
                    />
                  ) : (
                    documents.map((row) => (
                      <tr key={row.id} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          {formatDateOnly(row.document_date as Timestamp)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {DOC_TYPE_LABELS[(row.type as DocType) || 'other'] || row.type}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {row.title || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {row.file_name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDocument(row)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Open
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === row.id}
                              onClick={() => handleDelete(row)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deletingId === row.id ? '…' : 'Delete'}
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

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Download evidence pack
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Each pack is a ZIP with the period summary PDF (inspections and defects) plus the
              original uploaded documents dated in that window
              ({docsLast6.length} in last 6 months, {docsLast12.length} in last 12 months). Built on
              demand — nothing extra is stored.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={packBusyMonths !== null}
                onClick={() => handleDownloadPack(6)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white keep-light-on-dark hover:bg-blue-600 disabled:opacity-60"
              >
                <Download className="h-4 w-4 text-white keep-light-on-dark" />
                {packBusyMonths === 6 ? 'Building pack…' : 'Download 6 month Pack'}
              </button>
              <button
                type="button"
                disabled={packBusyMonths !== null}
                onClick={() => handleDownloadPack(12)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white keep-light-on-dark hover:bg-blue-600 disabled:opacity-60"
              >
                <Download className="h-4 w-4 text-white keep-light-on-dark" />
                {packBusyMonths === 12 ? 'Building pack…' : 'Download 12 month Pack'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
