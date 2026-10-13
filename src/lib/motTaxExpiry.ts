/**
 * Shared MOT / road-tax expiry bucketing so home KPIs and /dashboard/mot-tax
 * always count the same vehicles the same way.
 */

export type MotTaxExpiryBucket =
  | 'expired'
  | 'urgent'
  | 'warning'
  | 'ok'
  | 'not_due'
  | 'unknown'
  | 'unverified';

export const MOT_TAX_URGENT_DAYS = 7;
export const MOT_TAX_WARNING_DAYS = 30;

export type MotTaxExpiryInput = {
  mot_expiry_date?: { toDate?: () => Date } | Date | string | null;
  tax_expiry_date?: { toDate?: () => Date } | Date | string | null;
  dvla_sync_error?: string | null;
};

export type MotTaxClassification = {
  motDaysRemaining: number | null;
  taxDaysRemaining: number | null;
  motBucket: MotTaxExpiryBucket;
  taxBucket: MotTaxExpiryBucket;
  worstBucket: MotTaxExpiryBucket;
  soonestExpiryMs: number;
  hasSyncError: boolean;
};

export type MotTaxCounts = {
  expired: number;
  urgent: number;
  warning: number;
  /** Urgent + warning (due within 30 days, not expired). Matches mot-tax "Due soon" filter. */
  dueSoon: number;
  ok: number;
  unverified: number;
  unknown: number;
  total: number;
};

export function parseMotTaxDate(
  value?: { toDate?: () => Date } | Date | string | null
): Date | null {
  if (!value) return null;
  try {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'object' && typeof value.toDate === 'function') {
      return value.toDate();
    }
    const d = new Date(value as string);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function daysUntilMotTax(target: Date | null): number | null {
  if (!target) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(target);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

export function bucketForMotTax(
  days: number | null,
  type: 'mot' | 'tax'
): MotTaxExpiryBucket {
  if (days === null) {
    return type === 'mot' ? 'not_due' : 'unknown';
  }
  if (days < 0) return 'expired';
  if (days <= MOT_TAX_URGENT_DAYS) return 'urgent';
  if (days <= MOT_TAX_WARNING_DAYS) return 'warning';
  return 'ok';
}

export function worstMotTaxBucket(
  a: MotTaxExpiryBucket,
  b: MotTaxExpiryBucket
): MotTaxExpiryBucket {
  const order: MotTaxExpiryBucket[] = [
    'expired',
    'urgent',
    'warning',
    'unverified',
    'unknown',
    'not_due',
    'ok',
  ];
  return order.indexOf(a) <= order.indexOf(b) ? a : b;
}

export function isDvlaSyncError(vehicle: {
  dvla_sync_error?: string | null;
}): boolean {
  return Boolean(vehicle.dvla_sync_error && String(vehicle.dvla_sync_error).trim());
}

/**
 * Keep date-based severity when we still have expiry dates.
 * Only treat as unverified when sync failed and there is no expired/urgent/warning signal.
 */
function applySyncErrorBucket(bucket: MotTaxExpiryBucket): MotTaxExpiryBucket {
  if (bucket === 'expired' || bucket === 'urgent' || bucket === 'warning') {
    return bucket;
  }
  return 'unverified';
}

export function classifyMotTaxVehicle(
  vehicle: MotTaxExpiryInput
): MotTaxClassification {
  const motDate = parseMotTaxDate(vehicle.mot_expiry_date ?? null);
  const taxDate = parseMotTaxDate(vehicle.tax_expiry_date ?? null);
  const motDays = daysUntilMotTax(motDate);
  const taxDays = daysUntilMotTax(taxDate);
  const hasSyncError = isDvlaSyncError(vehicle);

  let motBucket = bucketForMotTax(motDays, 'mot');
  let taxBucket = bucketForMotTax(taxDays, 'tax');
  if (hasSyncError) {
    motBucket = applySyncErrorBucket(motBucket);
    taxBucket = applySyncErrorBucket(taxBucket);
  }

  const soonest = Math.min(
    motDate ? motDate.getTime() : Number.POSITIVE_INFINITY,
    taxDate ? taxDate.getTime() : Number.POSITIVE_INFINITY
  );

  return {
    motDaysRemaining: motDays,
    taxDaysRemaining: taxDays,
    motBucket,
    taxBucket,
    worstBucket: worstMotTaxBucket(motBucket, taxBucket),
    soonestExpiryMs: Number.isFinite(soonest) ? soonest : Number.POSITIVE_INFINITY,
    hasSyncError,
  };
}

export function countMotTaxStatus(
  vehicles: MotTaxExpiryInput[]
): MotTaxCounts {
  let expired = 0;
  let urgent = 0;
  let warning = 0;
  let ok = 0;
  let unverified = 0;
  let unknown = 0;

  for (const vehicle of vehicles) {
    const { motBucket, taxBucket, worstBucket } = classifyMotTaxVehicle(vehicle);
    if (motBucket === 'expired' || taxBucket === 'expired') {
      expired += 1;
    } else if (motBucket === 'urgent' || taxBucket === 'urgent') {
      urgent += 1;
    } else if (worstBucket === 'warning') {
      warning += 1;
    } else if (worstBucket === 'ok' || worstBucket === 'not_due') {
      ok += 1;
    } else if (worstBucket === 'unverified') {
      unverified += 1;
    } else if (worstBucket === 'unknown') {
      unknown += 1;
    }
  }

  return {
    expired,
    urgent,
    warning,
    dueSoon: urgent + warning,
    ok,
    unverified,
    unknown,
    total: vehicles.length,
  };
}
