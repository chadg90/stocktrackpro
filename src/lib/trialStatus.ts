/**
 * Web free-trial helpers — keep aligned with STP/services/companySubscription.js
 * and dashboard access gating.
 */

export type TrialCompanyFields = {
  subscription_status?: string | null;
  subscription_type?: string | null;
  legacy?: boolean | null;
  trial_end_date?: unknown;
  subscription_expiry_date?: unknown;
  stripe_subscription_id?: string | null;
  trial_start_date?: unknown;
  promo_schema_version?: number | null;
  promo_vehicle_limit?: number | null;
};

/** Parse Firestore Timestamp | Date | ISO string into a Date, or null. */
export function parseCompanyDate(value: unknown): Date | null {
  if (value == null) return null;
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    const d = new Date(value.includes('T') ? value : `${value}T23:59:59`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** End of the no-card web trial (prefer trial_end_date, then subscription_expiry_date). */
export function getTrialEndDate(company: TrialCompanyFields | null | undefined): Date | null {
  if (!company) return null;
  return parseCompanyDate(company.trial_end_date) ?? parseCompanyDate(company.subscription_expiry_date);
}

export function isWebTrialExpired(
  company: TrialCompanyFields | null | undefined,
  now: Date = new Date()
): boolean {
  if (!company) return false;
  if (company.legacy === true) return false;
  if (company.subscription_status !== 'trial' && company.subscription_status !== 'trialing') {
    return false;
  }
  const end = getTrialEndDate(company);
  if (!end) return false;
  return end.getTime() < now.getTime();
}

/**
 * Whether the company may use the paid product (dashboard + app modules).
 * Legacy accounts always pass. Active Stripe/paid pass. Trial passes only before trial_end_date.
 */
export function companyHasPaidAccess(
  company: TrialCompanyFields | null | undefined,
  now: Date = new Date()
): boolean {
  if (!company) return false;
  if (company.legacy === true) return true;

  const status = company.subscription_status;
  if (company.subscription_type === 'promotional') {
    const end = parseCompanyDate(company.subscription_expiry_date);
    return (
      status === 'active' &&
      company.promo_schema_version === 2 &&
      company.promo_vehicle_limit === 10 &&
      end != null &&
      end.getTime() >= now.getTime()
    );
  }
  if (status === 'active') return true;

  if (status === 'trial' || status === 'trialing') {
    return !isWebTrialExpired(company, now);
  }

  return false;
}

/** True if this company already consumed a web free trial (should not get another Stripe trial period). */
export function companyAlreadyUsedWebTrial(company: TrialCompanyFields | null | undefined): boolean {
  if (!company) return false;
  return (
    company.trial_start_date != null ||
    company.trial_end_date != null ||
    company.subscription_status === 'trial' ||
    company.subscription_status === 'inactive'
  );
}

/** UI badge status — based on real access, not a stale Firestore status field alone. */
export type SubscriptionDisplayStatus =
  | 'active'
  | 'trial'
  | 'trial_ended'
  | 'expired'
  | 'inactive';

export function getSubscriptionDisplayStatus(
  company: TrialCompanyFields | null | undefined,
  now: Date = new Date()
): SubscriptionDisplayStatus {
  if (!company) return 'inactive';
  if (company.legacy === true) return 'active';

  const hasAccess = companyHasPaidAccess(company, now);
  const status = company.subscription_status;

  if (hasAccess) {
    if (status === 'trial' || status === 'trialing') return 'trial';
    return 'active';
  }

  if (isWebTrialExpired(company, now)) return 'trial_ended';

  // Stored as active/trial but access checks failed (e.g. promo ended, expiry passed).
  if (
    status === 'active' ||
    status === 'trial' ||
    status === 'trialing' ||
    company.subscription_type === 'promotional'
  ) {
    return 'expired';
  }

  return 'inactive';
}
