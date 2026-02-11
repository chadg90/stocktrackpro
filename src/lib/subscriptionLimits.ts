/**
 * Subscription tier limits and enforcement helpers.
 * Used by the web dashboard to block create when at limit. The mobile app should
 * call checkCanAddUser before completing access-code sign-up, and checkCanAddVehicle
 * / checkCanAddAsset before creating vehicles or assets.
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

export type SubscriptionTier = 'PRO_STARTER' | 'PRO_TEAM' | 'PRO_BUSINESS' | 'PRO_ENTERPRISE';

/** Max allowed per tier. null = unlimited. */
export const TIER_LIMITS: Record<
  SubscriptionTier,
  { users: number; assets: number | null; vehicles: number }
> = {
  PRO_STARTER: { users: 1, assets: 50, vehicles: 5 },
  PRO_TEAM: { users: 10, assets: 500, vehicles: 15 },
  PRO_BUSINESS: { users: 40, assets: 1500, vehicles: 40 },
  PRO_ENTERPRISE: { users: 75, assets: 1500, vehicles: 150 },
};

const DEFAULT_TIER: SubscriptionTier = 'PRO_STARTER';

export interface LimitCheckResult {
  allowed: boolean;
  message?: string;
  current: number;
  limit: number | null;
  tier: SubscriptionTier;
}

async function getCompanyTier(db: Firestore, companyId: string): Promise<SubscriptionTier> {
  const companyRef = doc(db, 'companies', companyId);
  const snap = await getDoc(companyRef);
  if (!snap.exists()) return DEFAULT_TIER;
  const tier = snap.data()?.subscription_tier;
  if (tier && TIER_LIMITS[tier as SubscriptionTier]) return tier as SubscriptionTier;
  return DEFAULT_TIER;
}

async function getCount(db: Firestore, collectionName: string, companyId: string): Promise<number> {
  const q = query(
    collection(db, collectionName),
    where('company_id', '==', companyId)
  );
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

/**
 * Check if the company can add one more vehicle. Use before creating a vehicle.
 */
export async function checkCanAddVehicle(
  db: Firestore,
  companyId: string
): Promise<LimitCheckResult> {
  const tier = await getCompanyTier(db, companyId);
  const current = await getCount(db, 'vehicles', companyId);
  const limit = TIER_LIMITS[tier].vehicles;
  const allowed = limit !== null && current < limit;
  return {
    allowed,
    current,
    limit,
    tier,
    message: allowed
      ? undefined
      : `Vehicle limit reached (${current}/${limit}) for your plan. Upgrade or contact us for a higher limit.`,
  };
}

/**
 * Check if the company can add one more asset (tool). Use before creating an asset.
 */
export async function checkCanAddAsset(
  db: Firestore,
  companyId: string
): Promise<LimitCheckResult> {
  const tier = await getCompanyTier(db, companyId);
  const current = await getCount(db, 'tools', companyId);
  const limit = TIER_LIMITS[tier].assets;
  const allowed = limit === null || current < limit;
  return {
    allowed,
    current,
    limit,
    tier,
    message: allowed
      ? undefined
      : limit !== null
        ? `Asset limit reached (${current}/${limit}) for your plan. Upgrade or contact us for a higher limit.`
        : undefined,
  };
}

/**
 * Check if the company can add one more user (profile). Use before creating a user or temp account.
 */
export async function checkCanAddUser(
  db: Firestore,
  companyId: string
): Promise<LimitCheckResult> {
  const tier = await getCompanyTier(db, companyId);
  const current = await getCount(db, 'profiles', companyId);
  const limit = TIER_LIMITS[tier].users;
  const allowed = current < limit;
  return {
    allowed,
    current,
    limit,
    tier,
    message: allowed
      ? undefined
      : `User limit reached (${current}/${limit}) for your plan. Upgrade or contact us for a higher limit.`,
  };
}

/**
 * Get current usage and limits for a company (e.g. for display).
 */
export async function getUsage(
  db: Firestore,
  companyId: string
): Promise<{
  tier: SubscriptionTier;
  users: { current: number; limit: number };
  assets: { current: number; limit: number | null };
  vehicles: { current: number; limit: number };
}> {
  const tier = await getCompanyTier(db, companyId);
  const [users, assets, vehicles] = await Promise.all([
    getCount(db, 'profiles', companyId),
    getCount(db, 'tools', companyId),
    getCount(db, 'vehicles', companyId),
  ]);
  return {
    tier,
    users: { current: users, limit: TIER_LIMITS[tier].users },
    assets: { current: assets, limit: TIER_LIMITS[tier].assets },
    vehicles: { current: vehicles, limit: TIER_LIMITS[tier].vehicles },
  };
}
