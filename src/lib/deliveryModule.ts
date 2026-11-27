/**
 * Delivery add-on — shared types and helpers (website).
 * Billing: £15/vehicle/month; quantity mirrors subscribed_vehicles when active.
 */

export const DELIVERY_PRICE_GBP_MONTHLY = 15;
export const DELIVERY_DEFAULT_TRIAL_DAYS = 30;
export const DELIVERY_TEMPLATE_IMT_MEDICAL = 'imt_medical_v1';

export type DeliveryModuleStatus = 'trial' | 'active' | 'cancelled' | 'expired';

export type DeliveryModuleState = {
  status: DeliveryModuleStatus;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  vehicleQuantity?: number | null;
  stripe_subscription_item_id?: string | null;
  jobCap?: number | null;
  updated_at?: string;
};

export type CompanyWithDelivery = {
  modules?: {
    delivery?: DeliveryModuleState | null;
  } | null;
  subscribed_vehicles?: number | null;
};

export function getDeliveryModule(company: CompanyWithDelivery | null | undefined): DeliveryModuleState | null {
  const mod = company?.modules?.delivery;
  if (!mod || typeof mod !== 'object') return null;
  return mod;
}

/** UI / create access: trial (unexpired) or active paid. */
export function isDeliveryModuleOn(company: CompanyWithDelivery | null | undefined, nowMs = Date.now()): boolean {
  const mod = getDeliveryModule(company);
  if (!mod) return false;
  if (mod.status === 'active') return true;
  if (mod.status === 'trial') {
    if (!mod.trialEndsAt) return true;
    const end = Date.parse(mod.trialEndsAt);
    return Number.isFinite(end) ? end >= nowMs : true;
  }
  return false;
}

/** History readable after cancel/expire; new jobs blocked. */
export function canReadDeliveryJobs(company: CompanyWithDelivery | null | undefined, nowMs = Date.now()): boolean {
  const mod = getDeliveryModule(company);
  if (!mod) return false;
  if (isDeliveryModuleOn(company, nowMs)) return true;
  return ['cancelled', 'expired'].includes(mod.status);
}

export const IMT_BASE_COLLECTION_ITEMS = [
  'Heart',
  'Liver',
  'Lung Left',
  'Lung Right',
  'Kidney Left',
  'Kidney Right',
  'Pancreas',
  'Blood',
  'SNOD',
  'Small Bowel',
  'Cornea (Eye)',
  'Tissue',
] as const;

export const COLLECTION_ITEM_ADD_NEW = '__add_new__';

/** Items that require an explicit Blue lights authorised Yes/No on create. */
export const IMT_BLUE_LIGHTS_ITEMS = [
  'Heart',
  'Liver',
  'Lung Left',
  'Lung Right',
  'Kidney Left',
  'Kidney Right',
  'Pancreas',
  'Blood',
  'Small Bowel',
  'Cornea (Eye)',
  'Tissue',
] as const;

export function collectionItemNeedsBlueLights(item: string): boolean {
  const name = String(item || '').trim();
  if (!name || name === 'SNOD' || name === COLLECTION_ITEM_ADD_NEW) return false;
  if ((IMT_BLUE_LIGHTS_ITEMS as readonly string[]).includes(name)) return true;
  return !(IMT_BASE_COLLECTION_ITEMS as readonly string[]).includes(name);
}

/** @deprecated Prefer IMT_BASE_COLLECTION_ITEMS + COLLECTION_ITEM_ADD_NEW */
export const IMT_COLLECTION_ITEMS = [...IMT_BASE_COLLECTION_ITEMS, 'MISC'] as const;

export type ImtCollectionItem = (typeof IMT_COLLECTION_ITEMS)[number];

export function mergeCollectionItemOptions(customItems: string[] = []): string[] {
  const extras = (customItems || [])
    .map((s) => String(s || '').trim())
    .filter(Boolean)
    .filter((s) => !(IMT_BASE_COLLECTION_ITEMS as readonly string[]).includes(s));
  return [...IMT_BASE_COLLECTION_ITEMS, ...Array.from(new Set(extras))];
}

export type SavedHospital = {
  name: string;
  postcode: string;
};

export function hospitalKey(h: { name: string; postcode: string }): string {
  return `${String(h.postcode || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')}|${String(h.name || '')
    .trim()
    .toLowerCase()}`;
}

export function normalizeSavedHospitals(raw: unknown): SavedHospital[] {
  if (!Array.isArray(raw)) return [];
  const out: SavedHospital[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const name = String((item as { name?: string }).name || '').trim();
    const postcode = String((item as { postcode?: string }).postcode || '')
      .trim()
      .toUpperCase();
    if (!name || !postcode) continue;
    const key = hospitalKey({ name, postcode });
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, postcode });
  }
  return out
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 100);
}

export function isLikelyUkPostcode(value: string): boolean {
  const s = String(value || '')
    .replace(/\s+/g, '')
    .toUpperCase();
  return /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(s);
}

export function formatUkPostcode(value: string): string {
  const s = String(value || '')
    .replace(/\s+/g, '')
    .toUpperCase();
  if (s.length < 5) return s;
  return `${s.slice(0, -3)} ${s.slice(-3)}`;
}

export function mapsSearchUrl(addressLine: string, postcode: string): string {
  const q = encodeURIComponent(`${addressLine || ''} ${postcode || ''}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Display string stored on jobs, matching the app picker format. */
export function formatRequiredArrival(d: Date): string {
  const day = d.getDate();
  const mon = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${mon} ${year} ${hh}:${mm}`;
}

/** Value for `<input type="datetime-local" />`. */
export function toDatetimeLocalValue(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${day}T${hh}:${mm}`;
}

export function requiredArrivalFromDatetimeLocal(value: string): string {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  const d = new Date(trimmed);
  if (!Number.isFinite(d.getTime())) return trimmed;
  return formatRequiredArrival(d);
}

export const DELIVERY_EVENT_LABELS: Record<string, string> = {
  created: 'Job created',
  mobile_to_route_collection: 'Mobile to route — collection',
  arrived_collection: 'Arrived at collection',
  stood_down: 'Job stood down',
  confirm_collected: 'Collection confirmed',
  mobile_to_route_delivery: 'Mobile to route — delivery',
  arrived_delivery: 'Arrived at delivery',
  complete: 'Job completed',
  completed: 'Job completed',
  cancelled: 'Job cancelled',
  reassigned: 'Driver reassigned',
};

export type DeliveryJobStatus =
  | 'draft'
  | 'assigned'
  | 'en_route_collection'
  | 'at_collection'
  | 'collected'
  | 'en_route_delivery'
  | 'at_delivery'
  | 'completed'
  | 'stood_down'
  | 'cancelled';

export const DELIVERY_JOB_STATUS_LABELS: Record<DeliveryJobStatus, string> = {
  draft: 'Draft',
  assigned: 'Assigned',
  en_route_collection: 'En route to collection',
  at_collection: 'At collection',
  collected: 'Collected',
  en_route_delivery: 'En route to delivery',
  at_delivery: 'At delivery',
  completed: 'Completed',
  stood_down: 'Stood down',
  cancelled: 'Cancelled',
};
