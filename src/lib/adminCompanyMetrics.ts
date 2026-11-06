import { collection, getDocs, query, where, type Firestore } from 'firebase/firestore';

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
 */
export async function countCompanyFleetVehicles(
  db: Firestore,
  companyId: string
): Promise<{ live: number; retired: number }> {
  const snap = await getDocs(query(collection(db, 'vehicles'), where('company_id', '==', companyId)));
  let live = 0;
  let retired = 0;
  snap.docs.forEach((docSnap) => {
    const status = String(docSnap.data()?.status || 'active').toLowerCase();
    if (status === 'retired') retired += 1;
    else live += 1;
  });
  return { live, retired };
}
