/**
 * First-party dashboard product usage (no third-party cost).
 * Writes lightweight counters to Firestore for admin review.
 */

import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';

export type UsageKind = 'page_view' | 'feature_click';

/** Canonical dashboard pages we expect to see usage for. */
export const TRACKED_PAGES: Array<{ key: string; label: string; path: string }> = [
  { key: 'page:/dashboard', label: 'Dashboard home', path: '/dashboard' },
  { key: 'page:/dashboard/fleet', label: 'Fleet', path: '/dashboard/fleet' },
  { key: 'page:/dashboard/fleet-report', label: 'Fleet report', path: '/dashboard/fleet-report' },
  { key: 'page:/dashboard/mot-tax', label: 'MOT & Tax', path: '/dashboard/mot-tax' },
  { key: 'page:/dashboard/mileage-monitor', label: 'Mileage monitor', path: '/dashboard/mileage-monitor' },
  { key: 'page:/dashboard/defects', label: 'Defects', path: '/dashboard/defects' },
  { key: 'page:/dashboard/inspection-proof', label: 'Inspection proof', path: '/dashboard/inspection-proof' },
  { key: 'page:/dashboard/vehicle-reports', label: 'Vehicle reports', path: '/dashboard/vehicle-reports' },
  { key: 'page:/dashboard/history', label: 'Audit log', path: '/dashboard/history' },
  { key: 'page:/dashboard/team', label: 'Team', path: '/dashboard/team' },
  { key: 'page:/dashboard/subscription', label: 'Subscription', path: '/dashboard/subscription' },
  { key: 'page:/dashboard/support', label: 'Support', path: '/dashboard/support' },
  { key: 'page:/dashboard/companies', label: 'Companies (admin)', path: '/dashboard/companies' },
  { key: 'page:/dashboard/admin/promo-codes', label: 'Promo codes (admin)', path: '/dashboard/admin/promo-codes' },
  {
    key: 'page:/dashboard/admin/compliance-articles',
    label: 'Compliance articles (admin)',
    path: '/dashboard/admin/compliance-articles',
  },
  { key: 'page:/dashboard/admin/reports', label: 'Admin reports', path: '/dashboard/admin/reports' },
  {
    key: 'page:/dashboard/admin/product-usage',
    label: 'Product usage (admin)',
    path: '/dashboard/admin/product-usage',
  },
];

/** Key feature clicks (beyond page views). */
export const TRACKED_FEATURES: Array<{ key: string; label: string }> = [
  { key: 'feature:vehicle_pack_6m', label: 'Download 6 month Pack' },
  { key: 'feature:vehicle_pack_12m', label: 'Download 12 month Pack' },
  { key: 'feature:inspection_proof_export', label: 'Inspection proof export' },
  { key: 'feature:fleet_report_export', label: 'Fleet report export' },
];

function normalizePath(pathname: string): string {
  if (!pathname) return '/dashboard';
  let p = pathname.split('?')[0].split('#')[0];
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  // Collapse dynamic segments under known parents
  if (p.startsWith('/dashboard/fleet-report/')) return '/dashboard/fleet-report';
  if (p.startsWith('/dashboard/admin/') && !TRACKED_PAGES.some((x) => x.path === p)) {
    return '/dashboard/admin';
  }
  return p || '/dashboard';
}

function pageKey(pathname: string): string {
  return `page:${normalizePath(pathname)}`;
}

function totalDocId(key: string): string {
  return key.replace(/[^a-zA-Z0-9._:-]+/g, '_').slice(0, 700);
}

function todayId(): string {
  return new Date().toISOString().slice(0, 10);
}

function labelFor(key: string, kind: UsageKind): string {
  if (kind === 'page_view') {
    return TRACKED_PAGES.find((p) => p.key === key)?.label || key.replace(/^page:/, '');
  }
  return TRACKED_FEATURES.find((f) => f.key === key)?.label || key.replace(/^feature:/, '');
}

let lastPageKey = '';
let lastPageAt = 0;

async function writeUsage(kind: UsageKind, key: string): Promise<void> {
  if (!firebaseDb || !firebaseAuth?.currentUser) return;
  if (!key || key.length > 120) return;

  const dayId = todayId();
  const dayRef = doc(firebaseDb, 'product_usage_daily', dayId);
  const totalRef = doc(firebaseDb, 'product_usage_totals', totalDocId(key));

  await Promise.all([
    setDoc(
      dayRef,
      {
        date: dayId,
        counts: { [key]: increment(1) },
        updated_at: serverTimestamp(),
      },
      { merge: true }
    ),
    setDoc(
      totalRef,
      {
        key,
        kind,
        label: labelFor(key, kind),
        count: increment(1),
        last_seen: serverTimestamp(),
      },
      { merge: true }
    ),
  ]);
}

/** Track a dashboard page view (debounced per path). */
export async function trackDashboardPageView(pathname: string): Promise<void> {
  try {
    if (!pathname.startsWith('/dashboard')) return;
    // Skip bare login shell noise if needed later; track all authorized navigations.
    const key = pageKey(pathname);
    const now = Date.now();
    if (key === lastPageKey && now - lastPageAt < 4000) return;
    lastPageKey = key;
    lastPageAt = now;
    await writeUsage('page_view', key);
  } catch (err) {
    console.warn('product usage page_view skipped', err);
  }
}

/** Track a named feature click. */
export async function trackFeatureClick(featureKey: string): Promise<void> {
  try {
    const raw = featureKey.startsWith('feature:') ? featureKey : `feature:${featureKey}`;
    if (!/^[a-z0-9_.:/-]+$/i.test(raw) || raw.length > 120) return;
    await writeUsage('feature_click', raw);
  } catch (err) {
    console.warn('product usage feature_click skipped', err);
  }
}
