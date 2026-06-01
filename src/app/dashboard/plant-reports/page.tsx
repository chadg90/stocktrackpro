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
import { httpsCallable } from 'firebase/functions';
import { firebaseAuth, firebaseDb, firebaseFunctions } from '@/lib/firebase';
import { FileText, Search, Download, Lock, RefreshCw } from 'lucide-react';
import { EmptyStateTableRow } from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import TablePagination, { PAGE_SIZE } from '../components/TablePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { companyHasPlantModuleAccess } from '@/lib/plant/access';
import { getImageUrlFromApp } from '@/lib/getImageUrl';

type PlantInspection = {
  id: string;
  company_id: string;
  machine_id: string;
  reference_number?: string | null;
  inspection_date?: string;
  inspection_time?: string;
  snapshot_plant_number?: string;
  snapshot_make?: string;
  snapshot_model?: string;
  inspector_name?: string;
  includes_loler?: boolean;
  includes_service?: boolean;
  includes_hire_check?: boolean;
  defects_immediate_danger?: boolean;
  total_cost?: number | null;
  locked?: boolean;
  submitted_at?: Timestamp | { seconds: number };
  pdf_loler_url?: string | null;
  pdf_puwer_url?: string | null;
  pdf_service_url?: string | null;
  pdf_hire_check_url?: string | null;
  pdf_loler_path?: string | null;
  pdf_puwer_path?: string | null;
  pdf_service_path?: string | null;
  pdf_hire_check_path?: string | null;
  pdf_generation_started?: boolean;
  pdf_generated_at?: Timestamp | { seconds: number };
  pdf_generation_error?: string | null;
};

type Profile = { company_id?: string; role?: string };

function formatSubmittedAt(value: PlantInspection['submitted_at']): string {
  if (!value) return '—';
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  }
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000).toLocaleString('en-GB', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
  return '—';
}

function reportBadges(row: PlantInspection): string[] {
  const tags: string[] = [];
  if (row.includes_loler) tags.push('LOLER');
  tags.push('PUWER');
  if (row.includes_service) tags.push('Service');
  if (row.includes_hire_check) tags.push('Hire');
  return tags;
}

function PdfLink({
  label,
  url,
  path,
}: {
  label: string;
  url?: string | null;
  path?: string | null;
}) {
  const [href, setHref] = useState<string | null>(url || null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setHref(url || null);
  }, [url]);

  useEffect(() => {
    if (href || !path) return;
    let cancelled = false;
    setPending(true);
    getImageUrlFromApp(path)
      .then((resolved) => {
        if (!cancelled && resolved) setHref(resolved);
      })
      .finally(() => {
        if (!cancelled) setPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, href]);

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs"
      >
        <Download className="h-3 w-3" />
        {label}
      </a>
    );
  }
  return (
    <span className="text-white/30 text-xs" title={pending ? 'Loading PDF…' : 'PDF not generated yet'}>
      {pending ? `${label}…` : label}
    </span>
  );
}

export default function PlantReportsPage() {
  const [rows, setRows] = useState<PlantInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasPlantModule, setHasPlantModule] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const isManager = profile?.role === 'manager' || profile?.role === 'admin';

  const handleRetryPdfs = async (inspectionId: string) => {
    if (!firebaseFunctions) {
      alert('Functions are not available. Refresh the page and try again.');
      return;
    }
    setRetryingId(inspectionId);
    try {
      const retry = httpsCallable<{ inspectionId: string }, { success: boolean }>(
        firebaseFunctions,
        'retryPlantInspectionPdfs'
      );
      await retry({ inspectionId });
      if (profile?.company_id) await fetchInspections(profile.company_id);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Could not generate PDFs';
      alert(msg);
    } finally {
      setRetryingId(null);
    }
  };

  const needsPdfRetry = (row: PlantInspection) =>
    !!row.pdf_generation_error ||
    (row.locked &&
      !row.pdf_puwer_path &&
      !row.pdf_generation_started);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) {
        setLoading(false);
        return;
      }
      const snap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      const data = snap.data() as Profile;
      setProfile(data);
      if (data.company_id) {
        const companySnap = await getDoc(doc(firebaseDb, 'companies', data.company_id));
        setHasPlantModule(
          companySnap.exists() && companyHasPlantModuleAccess(companySnap.data())
        );
        await fetchInspections(data.company_id);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchInspections = async (companyId: string) => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      const q = query(
        collection(firebaseDb, 'plant_inspections'),
        where('company_id', '==', companyId),
        orderBy('submitted_at', 'desc')
      );
      const snap = await getDocs(q);
      setRows(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as PlantInspection))
      );
    } catch (e) {
      console.error('Error loading plant inspections:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const ref = (r.reference_number || '').toLowerCase();
      const plant = (r.snapshot_plant_number || '').toLowerCase();
      const inspector = (r.inspector_name || '').toLowerCase();
      const makeModel = `${r.snapshot_make || ''} ${r.snapshot_model || ''}`.toLowerCase();
      return ref.includes(q) || plant.includes(q) || inspector.includes(q) || makeModel.includes(q);
    });
  }, [rows, debouncedSearch]);

  useEffect(() => setCurrentPage(1), [debouncedSearch]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  if (!isManager) {
    return (
      <div className="p-8 text-white/70">
        Plant reports are available to managers and admins only.
      </div>
    );
  }

  return (
    <div>
      {hasPlantModule === false && (
        <div className="mb-6 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-100 text-sm">
          <strong>Plant module not active</strong> on your company yet.
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FileText className="h-8 w-8 text-amber-400" />
          Plant reports
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Submitted inspections from the mobile app. Records are locked after submit.
        </p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="search"
          placeholder="Search ref, plant no, inspector…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black border border-amber-500/30 rounded-lg pl-10 pr-3 py-2 text-white focus:border-amber-500 outline-none"
        />
      </div>

      <div className="rounded-xl border border-amber-500/20 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-amber-500/10 text-amber-100/90 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Machine</th>
              <th className="px-4 py-3">Inspector</th>
              <th className="px-4 py-3">Reports</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">PDFs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <TableSkeleton cols={7} rows={5} />
            ) : paginated.length === 0 ? (
              <EmptyStateTableRow
                colSpan={7}
                message="No inspections yet. Inspectors submit from the app (machine card or machine detail)."
              />
            ) : (
              paginated.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 text-white/90">
                  <td className="px-4 py-3 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      {row.locked && <Lock className="h-3 w-3 text-amber-400/80 shrink-0" aria-label="Locked record" />}
                      {row.reference_number || 'Pending ref'}
                    </div>
                    {row.defects_immediate_danger && (
                      <span className="text-red-400 text-xs">Immediate danger</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>{row.inspection_date || '—'}</div>
                    <div className="text-white/50 text-xs">{row.inspection_time || formatSubmittedAt(row.submitted_at)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.snapshot_plant_number || '—'}</div>
                    <div className="text-white/50 text-xs">
                      {[row.snapshot_make, row.snapshot_model].filter(Boolean).join(' ')}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.inspector_name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {reportBadges(row).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded bg-white/10 text-xs text-white/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.total_cost != null ? `£${Number(row.total_cost).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {row.includes_loler && (
                        <PdfLink label="LOLER" url={row.pdf_loler_url} path={row.pdf_loler_path} />
                      )}
                      <PdfLink label="PUWER" url={row.pdf_puwer_url} path={row.pdf_puwer_path} />
                      {row.includes_service && (
                        <PdfLink label="Service" url={row.pdf_service_url} path={row.pdf_service_path} />
                      )}
                      {row.includes_hire_check && (
                        <PdfLink label="Hire" url={row.pdf_hire_check_url} path={row.pdf_hire_check_path} />
                      )}
                      {needsPdfRetry(row) && (
                        <div className="flex flex-col gap-1 mt-1">
                          {row.pdf_generation_error && (
                            <span
                              className="text-red-600 dark:text-red-400 text-xs leading-snug"
                              title={row.pdf_generation_error}
                            >
                              PDF failed — redeploy functions, then retry
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={retryingId === row.id}
                            onClick={() => handleRetryPdfs(row.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50 dark:text-amber-400 dark:hover:text-amber-300"
                          >
                            <RefreshCw
                              className={`h-3 w-3 ${retryingId === row.id ? 'animate-spin' : ''}`}
                            />
                            {retryingId === row.id ? 'Generating…' : 'Generate PDFs'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > PAGE_SIZE && (
        <TablePagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
