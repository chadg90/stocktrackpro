/**
 * Web free-trial helpers — keep aligned with STP/services/companySubscription.js
 * and dashboard access gating.
 */

export type TrialCompanyFields = {
  subscription_status?: string | null;
  legacy?: boolean | null;
  trial_end_date?: unknown;
  subscription_expiry_date?: unknown;
  stripe_subscription_id?: string | null;
  trial_start_date?: unknown;
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
