'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import {
  DELIVERY_EVENT_LABELS,
  DELIVERY_JOB_STATUS_LABELS,
  formatUkPostcode,
  mapsSearchUrl,
  type DeliveryJobStatus,
} from '@/lib/deliveryModule';
import { buildDeliveryJobProofPdf } from '@/lib/deliveryJobProofPdf';
import {
  checkRmoPdfRateLimit,
  recordRmoPdfGeneration,
} from '@/lib/rmoPdfRateLimit';
import {
  hasEncodedSignature,
  signatureEncodedToSvgHtml,
} from '@/lib/signaturePaths';
import DashboardPageTitle from '@/app/dashboard/components/DashboardPageTitle';
import AuthenticatedImage from '@/app/dashboard/components/AuthenticatedImage';

type ArrivalStamp = {
  at?: string;
  location?: { lat?: number; lng?: number };
} | null;

type CollectionConfirmed = {
  collection_item?: string;
  collection_item_misc?: string;
  collected_at?: string;
  collection_snod_name?: string;
  box_photo_path?: string;
  serial_photo_path?: string;
  collection_signature_paths?: string;
  hub_informed?: boolean;
  at?: string;
} | null;

type CompletedStamp = {
  receiving_snod_name?: string;
  delivery_signature_paths?: string;
  delivery_proof_photo_path?: string;
  hub_informed?: boolean;
  at?: string;
} | null;

type StoodDownStamp = {
  reason?: string;
  at?: string;
} | null;

function statusTone(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'stood_down':
      return 'bg-orange-50 text-orange-900 border-orange-200';
    case 'cancelled':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'collected':
    case 'en_route_delivery':
    case 'at_delivery':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function formatEventTime(at?: string): string {
  if (!at) return '';
  const d = new Date(at);
  if (!Number.isFinite(d.getTime())) return at;
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatGps(stamp: ArrivalStamp): string | null {
  const lat = Number(stamp?.location?.lat);
  const lng = Number(stamp?.location?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900 truncate">{children}</div>
    </div>
  );
}

function SignatureBlock({ encoded, label }: { encoded?: string; label: string }) {
  const raw = String(encoded || '').trim();
  if (!hasEncodedSignature(raw)) return null;
  const svg = signatureEncodedToSvgHtml(raw, { width: 280, height: 96 });
  if (!svg) return null;
  return (
    <figure className="space-y-1.5 pt-2">
      <figcaption className="text-xs text-slate-500">{label}</figcaption>
      <div
        className="overflow-hidden rounded-lg border border-slate-200 bg-white p-2"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
}

function PlaceCard({
  label,
  hospital,
  postcode,
  ward,
  mapsHref,
  mapsLocked,
  arrived,
}: {
  label: string;
  hospital: string;
  postcode: string;
  ward?: string;
  mapsHref: string | null;
  mapsLocked?: boolean;
  arrived: ArrivalStamp;
}) {
  const gps = formatGps(arrived);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-3 min-h-[180px]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-base font-semibold text-slate-900 leading-snug">
          {hospital || '—'}
        </div>
        <div className="text-sm text-slate-600 font-medium tabular-nums">
          {postcode ? formatUkPostcode(postcode) : '—'}
        </div>
        {ward ? (
          <div className="text-sm text-slate-600">Ward / unit: {ward}</div>
        ) : null}
      </div>
      {mapsHref && !mapsLocked ? (
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Open in Maps
          <span aria-hidden>↗</span>
        </a>
      ) : mapsLocked ? (
        <p className="text-sm text-amber-800">
          Routing unlocks after collection is confirmed.
        </p>
      ) : null}
      {arrived?.at ? (
        <div className="pt-3 mt-auto border-t border-slate-100 text-xs text-slate-500 space-y-0.5">
          <div>Arrived {formatEventTime(arrived.at)}</div>
          <div className="tabular-nums">GPS {gps || 'not recorded'}</div>
        </div>
      ) : (
        <div className="pt-3 mt-auto border-t border-slate-100 text-xs text-slate-400">
          Arrival not logged yet
        </div>
      )}
    </div>
  );
}

export default function DeliveryJobDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{ url: string; fileName: string } | null>(null);
  const pdfPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb || !id) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(firebaseDb, 'delivery_jobs', id));
        setJob(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrlRef.current) {
        URL.revokeObjectURL(pdfPreviewUrlRef.current);
        pdfPreviewUrlRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl text-slate-600">
        <DashboardPageTitle title="Road movement order" />
        Loading…
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl space-y-3">
        <DashboardPageTitle title="Road movement order" />
        <p className="text-slate-600">Job not found.</p>
        <Link href="/dashboard/deliveries/" className="text-blue-600 hover:underline text-sm">
          Back to list
        </Link>
      </div>
    );
  }

  const status = String(job.status || '') as DeliveryJobStatus;
  const jobNumber = String(job.job_number || id);
  const clientName = String(job.client_name || '—');
  const itemLabel = [
    String(job.collection_item || ''),
    job.collection_item_misc ? `(${String(job.collection_item_misc)})` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const events = Array.isArray(job.events)
    ? (job.events as { type?: string; at?: string; by?: string; reason?: string }[])
    : [];
  const collectionHospital = String(job.collection_hospital || '');
  const collectionPostcode = String(job.collection_postcode || '');
  const collectionWard = String(job.collection_ward || '');
  const deliveryHospital = String(job.delivery_hospital || '');
  const deliveryPostcode = String(job.delivery_postcode || '');
  const deliveryWard = String(job.delivery_ward || '');
  const navigateUnlocked = Boolean(job.delivery_navigate_unlocked);
  const arrivedCollection = (job.arrived_collection || null) as ArrivalStamp;
  const arrivedDelivery = (job.arrived_delivery || null) as ArrivalStamp;
  const collectionConfirmed = (job.collection_confirmed || null) as CollectionConfirmed;
  const completed = (job.completed || null) as CompletedStamp;
  const stoodDown = (job.stood_down || null) as StoodDownStamp;
  const pageTitle = `Job ${jobNumber}`;

  const closePdfPreview = () => {
    if (pdfPreviewUrlRef.current) {
      URL.revokeObjectURL(pdfPreviewUrlRef.current);
      pdfPreviewUrlRef.current = null;
    }
    setPdfPreview(null);
  };

  const handlePdf = async () => {
    const rate = checkRmoPdfRateLimit();
    if (!rate.ok) {
      window.alert(rate.message);
      return;
    }
    setPdfBusy(true);
    try {
      const { blob, fileName } = await buildDeliveryJobProofPdf({
        id: String(job.id || id),
        job_number: jobNumber,
        client_name: clientName,
        status,
        collection_item: String(job.collection_item || ''),
        collection_item_misc: job.collection_item_misc
          ? String(job.collection_item_misc)
          : undefined,
        blue_lights_authorised:
          typeof job.blue_lights_authorised === 'boolean' ? job.blue_lights_authorised : null,
        assigned_driver_name: String(job.assigned_driver_name || ''),
        required_arrival_at: String(job.required_arrival_at || ''),
        collection_hospital: collectionHospital,
        collection_postcode: collectionPostcode,
        collection_ward: collectionWard,
        delivery_hospital: deliveryHospital,
        delivery_postcode: deliveryPostcode,
        delivery_ward: deliveryWard,
        collection_confirmed: collectionConfirmed,
        completed,
      });
      recordRmoPdfGeneration();
      if (pdfPreviewUrlRef.current) URL.revokeObjectURL(pdfPreviewUrlRef.current);
      const url = URL.createObjectURL(blob);
      pdfPreviewUrlRef.current = url;
      setPdfPreview({ url, fileName });
    } catch (e) {
      console.error(e);
      window.alert('Could not generate PDF. Please try again.');
    } finally {
      setPdfBusy(false);
    }
  };

  const downloadPdfPreview = () => {
    if (!pdfPreview) return;
    const a = document.createElement('a');
    a.href = pdfPreview.url;
    a.download = pdfPreview.fileName;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <DashboardPageTitle title={pageTitle} />

      <div>
        <Link
          href="/dashboard/deliveries/"
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← All jobs
        </Link>

        <div className="mt-3 text-[11px] font-medium tracking-wide text-slate-500">
          Job No.
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {jobNumber}
          </h1>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusTone(
              status
            )}`}
          >
            {DELIVERY_JOB_STATUS_LABELS[status] || status}
          </span>
          {status === 'completed' ? (
            <button
              type="button"
              onClick={() => void handlePdf()}
              disabled={pdfBusy}
              className="ml-auto inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {pdfBusy ? 'Preparing PDF…' : 'View PDF'}
            </button>
          ) : null}
        </div>

        <p className="mt-1.5 text-base text-slate-600">
          <span className="font-medium text-slate-800">{clientName}</span>
          {itemLabel ? (
            <>
              <span className="text-slate-300 mx-2">·</span>
              {itemLabel}
            </>
          ) : null}
          {typeof job.blue_lights_authorised === 'boolean' ? (
            <>
              <span className="text-slate-300 mx-2">·</span>
              Blue lights: {job.blue_lights_authorised ? 'Yes' : 'No'}
            </>
          ) : null}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 sm:divide-x sm:divide-slate-100">
          <div className="sm:pr-6">
            <MetaItem label="Driver">{String(job.assigned_driver_name || '—')}</MetaItem>
          </div>
          <div className="sm:pl-6">
            <MetaItem label="Required arrival">
              {String(job.required_arrival_at || '—')}
            </MetaItem>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Route</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <PlaceCard
            label="Collect from"
            hospital={collectionHospital}
            postcode={collectionPostcode}
            ward={collectionWard}
            mapsHref={
              collectionHospital && collectionPostcode
                ? mapsSearchUrl(collectionHospital, collectionPostcode)
                : null
            }
            arrived={arrivedCollection}
          />
          <div className="hidden md:flex items-center justify-center text-slate-300 text-lg font-light px-1">
            →
          </div>
          <PlaceCard
            label="Deliver to"
            hospital={deliveryHospital}
            postcode={deliveryPostcode}
            ward={deliveryWard}
            mapsHref={
              deliveryHospital && deliveryPostcode
                ? mapsSearchUrl(deliveryHospital, deliveryPostcode)
                : null
            }
            mapsLocked={!navigateUnlocked}
            arrived={arrivedDelivery}
          />
        </div>
      </div>

      {(collectionConfirmed || completed || stoodDown) && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Job record</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {collectionConfirmed ? (
              <div className="space-y-2 sm:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Collection
                </div>
                <dl className="grid gap-1.5 text-sm sm:grid-cols-2">
                  {collectionConfirmed.collected_at ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Collected</dt>
                      <dd className="text-slate-900 font-medium text-right">
                        {collectionConfirmed.collected_at}
                      </dd>
                    </div>
                  ) : null}
                  {collectionConfirmed.collection_snod_name ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">SNOD</dt>
                      <dd className="text-slate-900 font-medium text-right">
                        {collectionConfirmed.collection_snod_name}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Hub informed</dt>
                    <dd className="text-slate-900 font-medium text-right">
                      {collectionConfirmed.hub_informed ? 'Yes' : '—'}
                    </dd>
                  </div>
                </dl>
                {(collectionConfirmed.box_photo_path ||
                  collectionConfirmed.serial_photo_path) && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {collectionConfirmed.box_photo_path ? (
                      <figure className="space-y-1.5">
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 aspect-[4/3]">
                          <AuthenticatedImage
                            src={collectionConfirmed.box_photo_path}
                            alt="Box photo"
                            preferThumbnail
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <figcaption className="text-xs text-slate-500">Box</figcaption>
                      </figure>
                    ) : null}
                    {collectionConfirmed.serial_photo_path ? (
                      <figure className="space-y-1.5">
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 aspect-[4/3]">
                          <AuthenticatedImage
                            src={collectionConfirmed.serial_photo_path}
                            alt="Serial photo"
                            preferThumbnail
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <figcaption className="text-xs text-slate-500">Serial</figcaption>
                      </figure>
                    ) : null}
                  </div>
                )}
                <SignatureBlock
                  encoded={collectionConfirmed.collection_signature_paths}
                  label="Collection signature"
                />
              </div>
            ) : null}

            {completed ? (
              <div className="space-y-2 sm:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Order complete
                </div>
                <dl className="space-y-1.5 text-sm sm:grid sm:grid-cols-2 sm:gap-1.5">
                  {completed.receiving_snod_name ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Receiving SNOD</dt>
                      <dd className="text-slate-900 font-medium text-right">
                        {completed.receiving_snod_name}
                      </dd>
                    </div>
                  ) : null}
                  {completed.at ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Completed</dt>
                      <dd className="text-slate-900 font-medium text-right">
                        {formatEventTime(completed.at)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Hub informed</dt>
                    <dd className="text-slate-900 font-medium text-right">
                      {completed.hub_informed ? 'Yes' : '—'}
                    </dd>
                  </div>
                </dl>
                {completed.delivery_proof_photo_path ? (
                  <figure className="space-y-1.5 pt-2 max-w-xs">
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 aspect-[4/3]">
                      <AuthenticatedImage
                        src={completed.delivery_proof_photo_path}
                        alt="Delivery proof photo"
                        preferThumbnail
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <figcaption className="text-xs text-slate-500">Delivery proof</figcaption>
                  </figure>
                ) : null}
                <SignatureBlock
                  encoded={completed.delivery_signature_paths}
                  label="Delivery signature"
                />
              </div>
            ) : null}

            {stoodDown ? (
              <div className="space-y-2 sm:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Stood down
                </div>
                <dl className="space-y-1.5 text-sm">
                  {stoodDown.reason ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Reason</dt>
                      <dd className="text-slate-900 font-medium text-right">{stoodDown.reason}</dd>
                    </div>
                  ) : null}
                  {stoodDown.at ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">At</dt>
                      <dd className="text-slate-900 font-medium text-right">
                        {formatEventTime(stoodDown.at)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Timeline</h2>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No events yet.</p>
        ) : (
          <ol className="space-y-0">
            {events.map((ev, i) => {
              const label =
                DELIVERY_EVENT_LABELS[String(ev.type || '')] || String(ev.type || 'Event');
              const isLast = i === events.length - 1;
              return (
                <li key={`${ev.at}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
                  {!isLast && (
                    <span className="absolute left-[7px] top-4 bottom-0 w-px bg-slate-200" />
                  )}
                  <span className="relative z-[1] mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-blue-500 bg-white" />
                  <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{label}</div>
                      {ev.reason ? (
                        <div className="text-sm text-slate-600 mt-0.5">{ev.reason}</div>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-500 shrink-0 tabular-nums">
                      {formatEventTime(ev.at)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <p className="text-slate-400 text-xs">
        Drivers process this job in the app — route, arrive, photos, hub informed, complete.
      </p>

      {pdfPreview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="PDF preview"
        >
          <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {pdfPreview.fileName}
                </div>
                <div className="text-xs text-slate-500">Preview — download when ready</div>
              </div>
              <button
                type="button"
                onClick={downloadPdfPreview}
                className="inline-flex items-center rounded-lg bg-[var(--brand-blue)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--brand-blue-hover)]"
              >
                Download
              </button>
              <button
                type="button"
                onClick={closePdfPreview}
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <iframe
              title={pdfPreview.fileName}
              src={pdfPreview.url}
              className="h-full w-full flex-1 bg-slate-100"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
