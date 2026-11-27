import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';

/** Fields used to bucket companies for admin Paid / Promo / Legacy counts. */
export type AdminCompanyPlanFields = {
  legacy?: boolean;
  subscription_status?: string;
  subscription_type?: string;
  stripe_subscription_id?: string;
  billing_cycle?: string;
  subscribed_vehicles?: number;
  /** Admin-set / loyalty monthly amount when Stripe is unavailable. */
  monthly_amount_gbp?: number;
};

/**
 * Legacy = no plan limits (founder / demo). It is not a billing status —
 * a legacy firm can still be billed on Stripe (e.g. Newstreet).
 */
export function isLegacyCompany(company: AdminCompanyPlanFields): boolean {
  return company.legacy === true;
}

/** Promo/test free accounts (not Stripe-billed). */
export function isPromoCompany(company: AdminCompanyPlanFields): boolean {
  return company.subscription_type === 'promotional';
}

/**
 * Paying customer: active Stripe subscription — including legacy fixed-price
 * (e.g. Newstreet). Legacy alone is not enough; unpaid demo/legacy stays out.
 * Promo/test accounts without Stripe stay out of Paid and MRR.
 */
export function isPaidStripeCompany(company: AdminCompanyPlanFields): boolean {
  const status = (company.subscription_status || '').toLowerCase();
  if (status !== 'active') return false;

  const hasStripe =
    company.subscription_type === 'stripe' || Boolean(company.stripe_subscription_id);
  if (hasStripe) return true;

  // Admin-set custom monthly price marked as paying (no Stripe id yet).
  if (isPromoCompany(company)) return false;
  const custom = Number(company.monthly_amount_gbp);
  return Number.isFinite(custom) && custom > 0;
}

/** Legacy with no Stripe bill (e.g. internal demo) — shown on the Legacy tile. */
export function isLegacyOnlyCompany(company: AdminCompanyPlanFields): boolean {
  return isLegacyCompany(company) && !isPaidStripeCompany(company);
}

export type BillingCategory = 'paid' | 'legacy' | 'promo' | 'trial' | 'inactive';

/** One bucket for Admin home, Admin Reports, and Companies. Paid wins over Legacy. */
export function billingCategory(company: AdminCompanyPlanFields): BillingCategory {
  if (isPaidStripeCompany(company)) return 'paid';
  if (isLegacyOnlyCompany(company)) return 'legacy';
  if (isPromoCompany(company)) return 'promo';
  if (isTrialCompany(company)) return 'trial';
  return 'inactive';
}

const PRICE_PER_VEHICLE_MONTHLY = 8;
const PRICE_PER_VEHICLE_YEARLY = 84;

/**
 * Monthly amount for MRR. Loyalty/custom price wins; otherwise slots × list price
 * (annual ÷ 12). Not paid → 0.
 */
export function monthlyRevenueGbp(company: AdminCompanyPlanFields): number {
  if (!isPaidStripeCompany(company)) return 0;
  const custom = Number(company.monthly_amount_gbp);
  if (Number.isFinite(custom) && custom > 0) return Math.round(custom * 100) / 100;
  const slots = Number(company.subscribed_vehicles);
  if (!Number.isFinite(slots) || slots < 1) return 0;
  if ((company.billing_cycle || '').toLowerCase() === 'yearly') {
    return Math.round(((slots * PRICE_PER_VEHICLE_YEARLY) / 12) * 100) / 100;
  }
  return Math.round(slots * PRICE_PER_VEHICLE_MONTHLY * 100) / 100;
}

/** Companies plan column. Loyalty fixed price is labelled separately from Legacy (no bill). */
export function companyPlanLabel(company: AdminCompanyPlanFields): string {
  const custom = Number(company.monthly_amount_gbp);
  if (company.legacy === true && Number.isFinite(custom) && custom > 0) {
    return `Loyalty £${custom.toFixed(2)}/mo`;
  }
  if (company.legacy === true && !isPaidStripeCompany(company)) return 'Legacy';
  if (company.subscription_type === 'promotional' && !isPaidStripeCompany(company)) return 'Promo';
  if (company.subscription_type === 'stripe' || company.stripe_subscription_id) {
    return company.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly';
  }
  const status = (company.subscription_status || '').toLowerCase();
  if (status === 'trial' || status === 'trialing') return 'Trial';
  return company.subscription_type?.trim() || '—';
}

export function isTrialCompany(company: AdminCompanyPlanFields): boolean {
  if (isPaidStripeCompany(company) || isPromoCompany(company) || isLegacyCompany(company)) {
    return false;
  }
  const status = (company.subscription_status || '').toLowerCase();
  return status === 'trial' || status === 'trialing';
}

/**
 * Non-retired vehicles on this company (same definition as Companies → Vehicles).
 * Retired are counted separately so Admin home can show them without mixing totals.
 * Uses count aggregation (cheap) with a document-scan fallback if the composite index is missing.
 */
export async function countCompanyFleetVehicles(
  db: Firestore,
  companyId: string
): Promise<{ live: number; retired: number }> {
  const vehicles = collection(db, 'vehicles');
  const companyFilter = where('company_id', '==', companyId);

  try {
    const [totalSnap, retiredSnap] = await Promise.all([
      getCountFromServer(query(vehicles, companyFilter)),
      getCountFromServer(
        query(vehicles, companyFilter, where('status', '==', 'retired'))
      ),
    ]);
    const total = totalSnap.data().count;
    const retired = retiredSnap.data().count;
    return { live: Math.max(0, total - retired), retired };
  } catch {
    const snap = await getDocs(query(vehicles, companyFilter));
    let live = 0;
    let retired = 0;
    snap.docs.forEach((docSnap) => {
      const status = String(docSnap.data()?.status || 'active').toLowerCase();
      if (status === 'retired') retired += 1;
      else live += 1;
    });
    return { live, retired };
  }
}
