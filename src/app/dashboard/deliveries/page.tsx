'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { Calendar, Clock } from 'lucide-react';
import { firebaseAuth, firebaseDb, firebaseApp } from '@/lib/firebase';
import {
  COLLECTION_ITEM_ADD_NEW,
  DELIVERY_JOB_STATUS_LABELS,
  formatUkPostcode,
  hospitalKey,
  isLikelyUkPostcode,
  mapsSearchUrl,
  mergeCollectionItemOptions,
  normalizeSavedHospitals,
  requiredArrivalFromDatetimeLocal,
  collectionItemNeedsBlueLights,
  isDeliveryModuleOn,
  type DeliveryJobStatus,
  type SavedHospital,
} from '@/lib/deliveryModule';
import DashboardPageTitle from '@/app/dashboard/components/DashboardPageTitle';

function splitArrivalValue(value: string): { date: string; time: string } {
  const m = String(value || '').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (m) return { date: m[1], time: m[2] };
  return { date: '', time: '' };
}

function joinArrivalValue(date: string, time: string): string {
  if (!date || !time) return '';
  return `${date}T${time}`;
}

type Job = {
  id: string;
  job_number?: string;
  status?: string;
  collection_item?: string;
  assigned_driver_id?: string;
  assigned_driver_name?: string;
  client_name?: string;
  required_arrival_at?: string;
};

type Driver = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  displayName?: string;
};

function driverDisplayName(d: Driver): string {
  const first = String(d.firstName || d.first_name || '').trim();
  const last = String(d.lastName || d.last_name || '').trim();
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  const display = String(d.display_name || d.displayName || '').trim();
  if (display) return display;
  const name = String(d.name || '').trim();
  if (name) return name;
  return 'Unnamed driver';
}

/** Light-theme form controls (dashboard is theme-light). */
const fieldLabel = 'block text-sm text-slate-600';
const fieldInput =
  'delivery-field mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500';
const pickerBtn =
  'delivery-picker mt-1 flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 hover:bg-slate-50';
const pickerHint = 'text-slate-400 text-xs';
const optionsList =
  'delivery-options mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm';
const optionBtn =
  'w-full px-3 py-3 text-left text-sm text-slate-800 hover:bg-slate-50';
const optionBtnSelected = 'w-full px-3 py-3 text-left text-sm bg-blue-50 text-blue-800 font-semibold';
const optionBtnNew = 'w-full px-3 py-3 text-left text-sm text-emerald-700 font-medium hover:bg-emerald-50';
const confirmBox =
  'delivery-confirm rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2';

type ListTab = 'open' | 'completed';

const CLOSED_STATUSES = new Set(['completed', 'stood_down', 'cancelled']);

function isClosedJob(status?: string) {
  return CLOSED_STATUSES.has(String(status || ''));
}

function statusPillClass(status: string): string {
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

export default function DeliveriesPage() {
  const [loading, setLoading] = useState(true);
  const [moduleOn, setModuleOn] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [listTab, setListTab] = useState<ListTab>('open');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showDriverList, setShowDriverList] = useState(false);
  const [showItemList, setShowItemList] = useState(false);
  const [showCollectionHospitalList, setShowCollectionHospitalList] = useState(false);
  const [showDeliveryHospitalList, setShowDeliveryHospitalList] = useState(false);
  const [collectionOptions, setCollectionOptions] = useState<string[]>(() =>
    mergeCollectionItemOptions([])
  );
  const [savedHospitals, setSavedHospitals] = useState<SavedHospital[]>([]);
  const [collectionHospitalMode, setCollectionHospitalMode] = useState<'pick' | 'new'>('pick');
  const [deliveryHospitalMode, setDeliveryHospitalMode] = useState<'pick' | 'new'>('pick');
  const [saveCollectionHospital, setSaveCollectionHospital] = useState(true);
  const [saveDeliveryHospital, setSaveDeliveryHospital] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_name: '',
    job_number: '',
    assigned_driver_id: '',
    collection_item: 'Heart',
    collection_item_misc: '',
    collection_hospital: '',
    collection_postcode: '',
    collection_ward: '',
    delivery_hospital: '',
    delivery_postcode: '',
    delivery_ward: '',
    required_arrival_at: '',
  });
  const [blueLightsAuthorised, setBlueLightsAuthorised] = useState<boolean | null>(null);
  const isAddNewItem = form.collection_item === COLLECTION_ITEM_ADD_NEW;
  const needsBlueLights = collectionItemNeedsBlueLights(
    isAddNewItem ? form.collection_item_misc : form.collection_item
  );

  const openJobs = useMemo(() => jobs.filter((j) => !isClosedJob(j.status)), [jobs]);
  const completedJobs = useMemo(() => jobs.filter((j) => isClosedJob(j.status)), [jobs]);
  const tabJobs = listTab === 'open' ? openJobs : completedJobs;
  const visibleJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tabJobs;
    return tabJobs.filter((j) => {
      const hay = [
        j.job_number,
        j.client_name,
        j.assigned_driver_name,
        j.collection_item,
        DELIVERY_JOB_STATUS_LABELS[String(j.status || '') as DeliveryJobStatus],
        j.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [tabJobs, search]);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) {
        setLoading(false);
        return;
      }
      try {
        const profileSnap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
        const profile = profileSnap.exists() ? profileSnap.data() : null;
        const cid = profile ? String(profile.company_id || '') : '';
        const role = String(profile?.role || '').toLowerCase();
        const manager = role === 'manager' || role === 'admin';
        setIsManager(manager);
        if (!cid) {
          setLoading(false);
          return;
        }
        setCompanyId(cid);
        const companySnap = await getDoc(doc(firebaseDb, 'companies', cid));
        const company = companySnap.exists() ? companySnap.data() : null;
        const on = isDeliveryModuleOn(company || null);
        setModuleOn(on);
        setCollectionOptions(
          mergeCollectionItemOptions(
            Array.isArray(company?.delivery_custom_collection_items)
              ? company.delivery_custom_collection_items
              : []
          )
        );
        const hospitals = normalizeSavedHospitals(company?.delivery_saved_hospitals);
        setSavedHospitals(hospitals);
        if (hospitals.length === 0) {
          setCollectionHospitalMode('new');
          setDeliveryHospitalMode('new');
        }
        if (!on) {
          setLoading(false);
          return;
        }
        // Drivers may only query their own jobs (matches Firestore rules).
        const jobsQuery = manager
          ? query(
              collection(firebaseDb, 'delivery_jobs'),
              where('company_id', '==', cid),
              orderBy('created_at', 'desc')
            )
          : query(
              collection(firebaseDb, 'delivery_jobs'),
              where('company_id', '==', cid),
              where('assigned_driver_id', '==', user.uid),
              orderBy('created_at', 'desc')
            );
        const jobsSnap = await getDocs(jobsQuery);
        setJobs(jobsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })));
        const profilesSnap = await getDocs(
          query(collection(firebaseDb, 'profiles'), where('company_id', '==', cid))
        );
        setDrivers(
          profilesSnap.docs
            .map((d) => {
              const data = d.data() || {};
              return {
                id: d.id,
                name: data.name,
                firstName: data.firstName,
                lastName: data.lastName,
                first_name: data.first_name,
                last_name: data.last_name,
                display_name: data.display_name,
                displayName: data.displayName,
              } as Driver;
            })
            .sort((a, b) => driverDisplayName(a).localeCompare(driverDisplayName(b)))
        );
      } catch (e) {
        console.error(e);
        setError('Could not load road movement orders.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const validateCreateForm = (): string | null => {
    if (!form.client_name.trim() || !form.job_number.trim() || !form.assigned_driver_id) {
      return 'Client, job number and driver are required.';
    }
    if (!form.collection_hospital.trim() || !form.collection_postcode.trim()) {
      return 'Collection hospital and postcode are required.';
    }
    if (!form.delivery_hospital.trim() || !form.delivery_postcode.trim()) {
      return 'Delivery hospital and postcode are required.';
    }
    if (!form.required_arrival_at.trim()) {
      return 'Required hospital arrival is required.';
    }
    if (!Number.isFinite(new Date(form.required_arrival_at).getTime())) {
      return 'Pick a valid arrival date and time.';
    }
    if (form.collection_item === COLLECTION_ITEM_ADD_NEW && !form.collection_item_misc.trim()) {
      return 'Enter a name for the new collection item.';
    }
    if (
      !isLikelyUkPostcode(form.collection_postcode) ||
      !isLikelyUkPostcode(form.delivery_postcode)
    ) {
      return 'Enter a valid UK postcode for collection and delivery.';
    }
    if (needsBlueLights && blueLightsAuthorised === null) {
      return 'Select whether blue lights are authorised for this job.';
    }
    return null;
  };

  const reviewAddresses = () => {
    const err = validateCreateForm();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setConfirming(true);
  };

  const createJob = async () => {
    if (!firebaseApp || !firebaseAuth?.currentUser) return;
    const err = validateCreateForm();
    if (err) {
      setError(err);
      setConfirming(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const functions = getFunctions(firebaseApp, 'us-central1');
      const callable = httpsCallable(functions, 'createDeliveryJob');
      const driver = drivers.find((d) => d.id === form.assigned_driver_id);
      const collectionPc = formatUkPostcode(form.collection_postcode);
      const deliveryPc = formatUkPostcode(form.delivery_postcode);
      const shouldSaveCollection =
        saveCollectionHospital &&
        (collectionHospitalMode === 'new' ||
          !savedHospitals.some(
            (h) =>
              hospitalKey(h) ===
              hospitalKey({ name: form.collection_hospital.trim(), postcode: collectionPc })
          ));
      const shouldSaveDelivery =
        saveDeliveryHospital &&
        (deliveryHospitalMode === 'new' ||
          !savedHospitals.some(
            (h) =>
              hospitalKey(h) ===
              hospitalKey({ name: form.delivery_hospital.trim(), postcode: deliveryPc })
          ));

      await callable({
        job: {
          ...form,
          collection_postcode: collectionPc,
          delivery_postcode: deliveryPc,
          ...(form.collection_ward.trim()
            ? { collection_ward: form.collection_ward.trim() }
            : { collection_ward: undefined }),
          ...(form.delivery_ward.trim()
            ? { delivery_ward: form.delivery_ward.trim() }
            : { delivery_ward: undefined }),
          ...(needsBlueLights || blueLightsAuthorised !== null
            ? { blue_lights_authorised: blueLightsAuthorised === true }
            : {}),
          required_arrival_at: requiredArrivalFromDatetimeLocal(form.required_arrival_at),
          assigned_driver_name: driver ? driverDisplayName(driver) : '',
          save_collection_hospital: shouldSaveCollection,
          save_delivery_hospital: shouldSaveDelivery,
        },
      });
      setShowForm(false);
      setConfirming(false);
      setShowItemList(false);
      setShowCollectionHospitalList(false);
      setShowDeliveryHospitalList(false);
      setCollectionHospitalMode('pick');
      setDeliveryHospitalMode('pick');
      setBlueLightsAuthorised(null);
      setForm({
        client_name: '',
        job_number: '',
        assigned_driver_id: '',
        collection_item: 'Heart',
        collection_item_misc: '',
        collection_hospital: '',
        collection_postcode: '',
        collection_ward: '',
        delivery_hospital: '',
        delivery_postcode: '',
        delivery_ward: '',
        required_arrival_at: '',
      });
      if (companyId && firebaseDb) {
        const jobsSnap = await getDocs(
          query(
            collection(firebaseDb, 'delivery_jobs'),
            where('company_id', '==', companyId),
            orderBy('created_at', 'desc')
          )
        );
        setJobs(jobsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })));
        const companySnap = await getDoc(doc(firebaseDb, 'companies', companyId));
        const company = companySnap.exists() ? companySnap.data() : null;
        setCollectionOptions(
          mergeCollectionItemOptions(
            Array.isArray(company?.delivery_custom_collection_items)
              ? company.delivery_custom_collection_items
              : []
          )
        );
        setSavedHospitals(normalizeSavedHospitals(company?.delivery_saved_hospitals));
      }
    } catch (e: unknown) {
      const fb = e as { code?: string; message?: string };
      const raw = (fb?.message || (e instanceof Error ? e.message : '') || '').trim();
      const looksInternal = !raw || /^internal$/i.test(raw);
      setError(
        looksInternal
          ? 'Could not create job. Please try again in a moment.'
          : raw
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-slate-600">
        <DashboardPageTitle title="Road Movement Orders" />
        Loading…
      </div>
    );
  }

  if (!moduleOn) {
    return (
      <div className="p-6 space-y-4">
        <DashboardPageTitle title="Road Movement Orders" />
        <p className="text-slate-600 max-w-xl">
          Road Movement Orders are not active for your company. Contact Fleet Track PRO support to start
          a trial or subscribe (£15 per vehicle / month on top of your fleet plan).
        </p>
        <Link href="/features/delivery/" className="text-blue-600 hover:underline text-sm">
          Learn about Road Movement Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardPageTitle title="Road Movement Orders" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-slate-600 text-sm max-w-2xl">
          Assign and track road movement orders for your drivers.
        </p>
        {isManager ? (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600"
          >
            {showForm ? 'Close form' : 'New job'}
          </button>
        ) : null}
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {showForm && isManager && confirming && (
        <div className="dashboard-card p-5 space-y-4 max-w-2xl">
          <h2 className="text-slate-900 font-semibold text-lg">Confirm addresses</h2>
          <p className="text-sm text-slate-600">
            Check these carefully before assigning. Wrong hospital = wrong delivery.
          </p>
          <div className={confirmBox}>
            <div className="text-xs uppercase tracking-wide text-slate-500">Collect from</div>
            <div className="text-slate-900 font-semibold">{form.collection_hospital.trim()}</div>
            <div className="text-slate-700">{formatUkPostcode(form.collection_postcode)}</div>
            {form.collection_ward.trim() ? (
              <div className="text-slate-600 text-sm mt-1">Ward / unit: {form.collection_ward.trim()}</div>
            ) : null}
            <a
              href={mapsSearchUrl(form.collection_hospital, form.collection_postcode)}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-blue-600 hover:underline"
            >
              Preview in Maps
            </a>
          </div>
          <div className={confirmBox}>
            <div className="text-xs uppercase tracking-wide text-slate-500">Deliver to</div>
            <div className="text-slate-900 font-semibold">{form.delivery_hospital.trim()}</div>
            <div className="text-slate-700">{formatUkPostcode(form.delivery_postcode)}</div>
            {form.delivery_ward.trim() ? (
              <div className="text-slate-600 text-sm mt-1">Ward / unit: {form.delivery_ward.trim()}</div>
            ) : null}
            <a
              href={mapsSearchUrl(form.delivery_hospital, form.delivery_postcode)}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-blue-600 hover:underline"
            >
              Preview in Maps
            </a>
          </div>
          <div className="text-sm text-slate-600 whitespace-pre-line">
            {`Item: ${isAddNewItem ? form.collection_item_misc.trim() : form.collection_item}${
              needsBlueLights
                ? `\nBlue lights authorised: ${
                    blueLightsAuthorised === true
                      ? 'Yes'
                      : blueLightsAuthorised === false
                        ? 'No'
                        : '—'
                  }`
                : ''
            }
Arrival: ${requiredArrivalFromDatetimeLocal(form.required_arrival_at)}
Driver: ${
              (() => {
                const selected = drivers.find((d) => d.id === form.assigned_driver_id);
                return selected ? driverDisplayName(selected) : '—';
              })()
            }`}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={createJob}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Confirm addresses & assign'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50"
            >
              Back to edit
            </button>
          </div>
        </div>
      )}

      {showForm && isManager && !confirming && (
        <div className="dashboard-card p-5 space-y-3 max-w-2xl">
          <h2 className="text-slate-900 font-semibold text-lg">Create road movement order</h2>
          {(
            [
              ['client_name', 'Client'],
              ['job_number', 'Job number'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={fieldLabel}>
              {label}
              <input
                className={fieldInput}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
          <div className={fieldLabel}>
            <span>Assigned response driver</span>
            <button
              type="button"
              onClick={() => setShowDriverList((v) => !v)}
              className={pickerBtn}
            >
              <span>
                {(() => {
                  const selected = drivers.find((d) => d.id === form.assigned_driver_id);
                  return selected ? driverDisplayName(selected) : 'Select…';
                })()}
              </span>
              <span className={pickerHint}>{showDriverList ? 'Hide' : 'Show'}</span>
            </button>
            {showDriverList && (
              <ul className={optionsList}>
                {drivers.length === 0 ? (
                  <li className="px-3 py-3 text-slate-500 text-sm">No drivers found</li>
                ) : (
                  drivers.map((d, index) => {
                    const label = driverDisplayName(d);
                    const selected = form.assigned_driver_id === d.id;
                    return (
                      <li
                        key={d.id}
                        className={index < drivers.length - 1 ? 'border-b border-slate-100' : ''}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, assigned_driver_id: d.id }));
                            setShowDriverList(false);
                          }}
                          className={selected ? optionBtnSelected : optionBtn}
                        >
                          {label}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
          <div className={fieldLabel}>
            <span>Collection item</span>
            <button
              type="button"
              onClick={() => setShowItemList((v) => !v)}
              className={pickerBtn}
            >
              <span>
                {isAddNewItem ? 'Add new item…' : form.collection_item || 'Select…'}
              </span>
              <span className={pickerHint}>{showItemList ? 'Hide' : 'Show'}</span>
            </button>
            {showItemList && (
              <ul className={optionsList}>
                {collectionOptions.map((item) => {
                  const selected = form.collection_item === item;
                  return (
                    <li key={item} className="border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({
                            ...f,
                            collection_item: item,
                            collection_item_misc: '',
                          }));
                          setBlueLightsAuthorised(null);
                          setShowItemList(false);
                        }}
                        className={selected ? optionBtnSelected : optionBtn}
                      >
                        {item}
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, collection_item: COLLECTION_ITEM_ADD_NEW }));
                      setBlueLightsAuthorised(null);
                      setShowItemList(false);
                    }}
                    className={isAddNewItem ? optionBtnSelected : optionBtnNew}
                  >
                    + Add new item…
                  </button>
                </li>
              </ul>
            )}
          </div>
          {isAddNewItem && (
            <label className={fieldLabel}>
              New item name
              <input
                className={fieldInput}
                value={form.collection_item_misc}
                onChange={(e) => {
                  setForm((f) => ({ ...f, collection_item_misc: e.target.value }));
                  setBlueLightsAuthorised(null);
                }}
                placeholder="e.g. Bone"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Saved to your company list for next time.
              </span>
            </label>
          )}

          {needsBlueLights && (
            <div className={fieldLabel}>
              <span>Blue lights authorised *</span>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setBlueLightsAuthorised(true)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                    blueLightsAuthorised === true
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setBlueLightsAuthorised(false)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                    blueLightsAuthorised === false
                      ? 'border-red-400 bg-red-50 text-red-800'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          <div className={fieldLabel}>
            <span>Collection hospital</span>
            <button
              type="button"
              onClick={() => {
                setShowCollectionHospitalList((v) => !v);
                setShowDeliveryHospitalList(false);
              }}
              className={pickerBtn}
            >
              <span>
                {collectionHospitalMode === 'new' && !form.collection_hospital
                  ? 'Add new hospital…'
                  : form.collection_hospital
                    ? `${form.collection_hospital} (${form.collection_postcode || 'no postcode'})`
                    : 'Select hospital'}
              </span>
              <span className={pickerHint}>
                {showCollectionHospitalList ? 'Hide' : 'Show'}
              </span>
            </button>
            {showCollectionHospitalList && (
              <ul className={optionsList}>
                {savedHospitals.length === 0 ? (
                  <li className="px-3 py-3 text-slate-500 text-sm">No saved hospitals yet</li>
                ) : (
                  savedHospitals.map((h) => (
                    <li key={hospitalKey(h)} className="border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({
                            ...f,
                            collection_hospital: h.name,
                            collection_postcode: h.postcode,
                          }));
                          setCollectionHospitalMode('pick');
                          setSaveCollectionHospital(false);
                          setShowCollectionHospitalList(false);
                        }}
                        className={optionBtn}
                      >
                        <div className="font-semibold">{h.name}</div>
                        <div className="text-slate-500">{h.postcode}</div>
                      </button>
                    </li>
                  ))
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCollectionHospitalMode('new');
                      setForm((f) => ({
                        ...f,
                        collection_hospital: '',
                        collection_postcode: '',
                      }));
                      setSaveCollectionHospital(true);
                      setShowCollectionHospitalList(false);
                    }}
                    className={optionBtnNew}
                  >
                    + Add new hospital…
                  </button>
                </li>
              </ul>
            )}
            {collectionHospitalMode === 'new' && (
              <div className="mt-2 space-y-2">
                <input
                  className={fieldInput}
                  placeholder="Hospital name / full address"
                  value={form.collection_hospital}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, collection_hospital: e.target.value }))
                  }
                />
                <input
                  className={`${fieldInput} uppercase`}
                  placeholder="Postcode"
                  value={form.collection_postcode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, collection_postcode: e.target.value }))
                  }
                />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={saveCollectionHospital}
                    onChange={(e) => setSaveCollectionHospital(e.target.checked)}
                  />
                  Save this hospital for next time
                </label>
              </div>
            )}
            {(form.collection_hospital || collectionHospitalMode === 'new') && (
              <>
                <label className={`${fieldLabel} mt-2 block`}>
                  Collection ward / unit
                  <input
                    className={fieldInput}
                    value={form.collection_ward}
                    onChange={(e) => setForm((f) => ({ ...f, collection_ward: e.target.value }))}
                    placeholder="Which ward or unit?"
                  />
                </label>
                <a
                  href={mapsSearchUrl(form.collection_hospital, form.collection_postcode)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                >
                  Preview collection in Maps
                </a>
              </>
            )}
          </div>

          <div className={fieldLabel}>
            <span>Delivery hospital</span>
            <button
              type="button"
              onClick={() => {
                setShowDeliveryHospitalList((v) => !v);
                setShowCollectionHospitalList(false);
              }}
              className={pickerBtn}
            >
              <span>
                {deliveryHospitalMode === 'new' && !form.delivery_hospital
                  ? 'Add new hospital…'
                  : form.delivery_hospital
                    ? `${form.delivery_hospital} (${form.delivery_postcode || 'no postcode'})`
                    : 'Select hospital'}
              </span>
              <span className={pickerHint}>
                {showDeliveryHospitalList ? 'Hide' : 'Show'}
              </span>
            </button>
            {showDeliveryHospitalList && (
              <ul className={optionsList}>
                {savedHospitals.length === 0 ? (
                  <li className="px-3 py-3 text-slate-500 text-sm">No saved hospitals yet</li>
                ) : (
                  savedHospitals.map((h) => (
                    <li key={`d-${hospitalKey(h)}`} className="border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({
                            ...f,
                            delivery_hospital: h.name,
                            delivery_postcode: h.postcode,
                          }));
                          setDeliveryHospitalMode('pick');
                          setSaveDeliveryHospital(false);
                          setShowDeliveryHospitalList(false);
                        }}
                        className={optionBtn}
                      >
                        <div className="font-semibold">{h.name}</div>
                        <div className="text-slate-500">{h.postcode}</div>
                      </button>
                    </li>
                  ))
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryHospitalMode('new');
                      setForm((f) => ({
                        ...f,
                        delivery_hospital: '',
                        delivery_postcode: '',
                      }));
                      setSaveDeliveryHospital(true);
                      setShowDeliveryHospitalList(false);
                    }}
                    className={optionBtnNew}
                  >
                    + Add new hospital…
                  </button>
                </li>
              </ul>
            )}
            {deliveryHospitalMode === 'new' && (
              <div className="mt-2 space-y-2">
                <input
                  className={fieldInput}
                  placeholder="Hospital name / full address"
                  value={form.delivery_hospital}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, delivery_hospital: e.target.value }))
                  }
                />
                <input
                  className={`${fieldInput} uppercase`}
                  placeholder="Postcode"
                  value={form.delivery_postcode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, delivery_postcode: e.target.value }))
                  }
                />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={saveDeliveryHospital}
                    onChange={(e) => setSaveDeliveryHospital(e.target.checked)}
                  />
                  Save this hospital for next time
                </label>
              </div>
            )}
            {(form.delivery_hospital || deliveryHospitalMode === 'new') && (
              <>
                <label className={`${fieldLabel} mt-2 block`}>
                  Delivery ward / unit
                  <input
                    className={fieldInput}
                    value={form.delivery_ward}
                    onChange={(e) => setForm((f) => ({ ...f, delivery_ward: e.target.value }))}
                    placeholder="Which ward or unit?"
                  />
                </label>
                <a
                  href={mapsSearchUrl(form.delivery_hospital, form.delivery_postcode)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                >
                  Preview delivery in Maps
                </a>
              </>
            )}
          </div>

          <div>
            <div className={fieldLabel}>Required hospital arrival</div>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <label className="relative block">
                <span className="sr-only">Date</span>
                <Calendar
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="date"
                  className={`${fieldInput} pl-9`}
                  value={splitArrivalValue(form.required_arrival_at).date}
                  onChange={(e) => {
                    const date = e.target.value;
                    const { time } = splitArrivalValue(form.required_arrival_at);
                    setForm((f) => ({
                      ...f,
                      required_arrival_at: joinArrivalValue(date, time || '09:00'),
                    }));
                  }}
                />
              </label>
              <label className="relative block">
                <span className="sr-only">Time</span>
                <Clock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="time"
                  className={`${fieldInput} pl-9`}
                  value={splitArrivalValue(form.required_arrival_at).time}
                  onChange={(e) => {
                    const time = e.target.value;
                    const { date } = splitArrivalValue(form.required_arrival_at);
                    if (!date) {
                      setForm((f) => ({ ...f, required_arrival_at: '' }));
                      return;
                    }
                    setForm((f) => ({
                      ...f,
                      required_arrival_at: joinArrivalValue(date, time),
                    }));
                  }}
                />
              </label>
            </div>
            {form.required_arrival_at ? (
              <p className="mt-2 text-sm font-medium text-slate-800">
                {requiredArrivalFromDatetimeLocal(form.required_arrival_at)}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">Choose a date and time</p>
            )}
          </div>

          <button
            type="button"
            onClick={reviewAddresses}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
          >
            Review addresses
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 self-start">
          <button
            type="button"
            onClick={() => setListTab('open')}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              listTab === 'open'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Open{openJobs.length ? ` (${openJobs.length})` : ''}
          </button>
          <button
            type="button"
            onClick={() => setListTab('completed')}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              listTab === 'completed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed{completedJobs.length ? ` (${completedJobs.length})` : ''}
          </button>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search job no., client, driver, item…"
          className="w-full sm:w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Arrival</th>
            </tr>
          </thead>
          <tbody>
            {visibleJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-slate-500 text-center">
                  {jobs.length === 0
                    ? 'No jobs yet.'
                    : search.trim()
                      ? 'No jobs match your search.'
                      : listTab === 'open'
                        ? 'No open jobs.'
                        : 'No completed jobs yet.'}
                </td>
              </tr>
            ) : (
              visibleJobs.map((job) => {
                const status = String(job.status || 'assigned') as DeliveryJobStatus;
                return (
                  <tr
                    key={job.id}
                    className="border-t border-slate-100 text-slate-800 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/deliveries/${job.id}/`} className="group block">
                        <div className="font-semibold text-slate-900 tabular-nums group-hover:text-blue-600">
                          {job.job_number || job.id}
                        </div>
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">{job.client_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusPillClass(
                          status
                        )}`}
                      >
                        {DELIVERY_JOB_STATUS_LABELS[status] || status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{job.collection_item}</td>
                    <td className="px-4 py-3">{job.assigned_driver_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{job.required_arrival_at || '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
