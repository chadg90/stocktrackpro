/**
 * Subscription limits for the per-vehicle model.
 *
 * Vehicle limit  = subscribed_vehicles (what the company paid for in Stripe)
 * Asset / user limits = derived from the same tier thresholds used on the pricing page
 *
 * Legacy companies (legacy: true on their company document) bypass all limits.
 * Backward-compatible with companies that still have subscription_tier set.
 */

import {
  collection,
  doc,
  getDoc,
  getCountFromServer,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';

// Tier thresholds — must match the pricing page
const TIERS = [
  { maxVehicles: 15,  users: 15,        assets: 1_000   },
  { maxVehicles: 35,  users: 35,        assets: 5_000   },
  { maxVehicles: 75,  users: 75,        assets: 20_000  },
  { maxVehicles: Infinity, users: null, assets: null    }, // Enterprise — unlimited
] as const;

/** Backward-compat mapping for companies still on the old tier strings. */
const LEGACY_TIER_LIMITS: Record<string, { users: number; assets: number | null; vehicles: number }> = {
  PRO_STARTER:    { users: 1,  assets: 50,   vehicles: 5   },
  PRO_TEAM:       { users: 10, assets: 500,  vehicles: 15  },
  PRO_BUSINESS:   { users: 40, assets: 1500, vehicles: 40  },
  PRO_ENTERPRISE: { users: 75, assets: 1500, vehicles: 150 },
};

export interface LimitCheckResult {
  allowed: boolean;
  message?: string;
  current: number;
  limit: number | null; // null = unlimited
}

type CompanyDoc = {
  legacy?: boolean;
  subscribed_vehicles?: number;
  subscription_tier?: string;
  subscription_status?: string;
};

function deriveLimits(subscribedVehicles: number): { users: number | null; assets: number | null; vehicles: number } {
  const tier = TIERS.find((t) => subscribedVehicles <= t.maxVehicles) ?? TIERS[TIERS.length - 1];
  return {
    vehicles: subscribedVehicles,
    users: tier.users ?? null,
    assets: tier.assets ?? null,
  };
}

async function getCompanyDoc(db: Firestore, companyId: string): Promise<CompanyDoc> {
  const snap = await getDoc(doc(db, 'companies', companyId));
  return snap.exists() ? (snap.data() as CompanyDoc) : {};
}

async function getCount(db: Firestore, collectionName: string, companyId: string): Promise<number> {
  const q = query(collection(db, collectionName), where('company_id', '==', companyId));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

function getLimitsFromCompany(company: CompanyDoc): { users: number | null; assets: number | null; vehicles: number | null } {
  // Legacy companies are unlimited across the board
  if (company.legacy) return { users: null, assets: null, vehicles: null };

  // New per-vehicle model
  if (company.subscribed_vehicles && company.subscribed_vehicles > 0) {
    return deriveLimits(company.subscribed_vehicles);
  }

  // Backward compat: old tier string
  if (company.subscription_tier && LEGACY_TIER_LIMITS[company.subscription_tier]) {
    const t = LEGACY_TIER_LIMITS[company.subscription_tier];
    return { users: t.users, assets: t.assets, vehicles: t.vehicles };
  }

  // No active subscription — allow minimal usage (5 vehicles, 500 assets, 5 users)
  return { users: 5, assets: 500, vehicles: 5 };
}

/** Check if the company can add one more vehicle. */
export async function checkCanAddVehicle(db: Firestore, companyId: string): Promise<LimitCheckResult> {
  const company = await getCompanyDoc(db, companyId);
  const limits = getLimitsFromCompany(company);
  const current = await getCount(db, 'vehicles', companyId);
  const limit = limits.vehicles;
  const allowed = limit === null || current < limit;
  return {
    allowed,
    current,
    limit,
    message: allowed ? undefined : `Vehicle limit reached (${current}/${limit}). To add more vehicles, update your subscription on the billing page.`,
  };
}

/** Check if the company can add one more asset (tool). */
export async function checkCanAddAsset(db: Firestore, companyId: string): Promise<LimitCheckResult> {
  const company = await getCompanyDoc(db, companyId);
  const limits = getLimitsFromCompany(company);
  const current = await getCount(db, 'tools', companyId);
  const limit = limits.assets;
  const allowed = limit === null || current < limit;
  return {
    allowed,
    current,
    limit,
    message: allowed ? undefined : `Asset limit reached (${current}/${limit ?? '∞'}). To add more assets, update your subscription on the billing page.`,
  };
}

/** Check if the company can add one more user (invite). */
export async function checkCanAddUser(db: Firestore, companyId: string): Promise<LimitCheckResult> {
  const company = await getCompanyDoc(db, companyId);
  const limits = getLimitsFromCompany(company);
  const current = await getCount(db, 'profiles', companyId);
  const limit = limits.users;
  const allowed = limit === null || current < limit;
  return {
    allowed,
    current,
    limit,
    message: allowed ? undefined : `User limit reached (${current}/${limit}). To invite more team members, update your subscription on the billing page.`,
  };
}

/** Get current usage summary for display (e.g. on subscription page). */
export async function getUsage(db: Firestore, companyId: string): Promise<{
  legacy: boolean;
  subscribedVehicles: number | null;
  users:    { current: number; limit: number | null };
  assets:   { current: number; limit: number | null };
  vehicles: { current: number; limit: number | null };
}> {
  const company = await getCompanyDoc(db, companyId);
  const limits = getLimitsFromCompany(company);
  const [users, assets, vehicles] = await Promise.all([
    getCount(db, 'profiles', companyId),
    getCount(db, 'tools', companyId),
    getCount(db, 'vehicles', companyId),
  ]);
  return {
    legacy: Boolean(company.legacy),
    subscribedVehicles: company.subscribed_vehicles ?? null,
    users:    { current: users,    limit: limits.users    },
    assets:   { current: assets,   limit: limits.assets   },
    vehicles: { current: vehicles, limit: limits.vehicles },
  };
}
