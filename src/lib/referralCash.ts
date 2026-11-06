/**
 * Display-only referral commission schedule (invite-only scheme).
 * 30% of the referred firm's actual monthly amount for 12 months,
 * paid on the 15th, confirmed after 2 paid months.
 */

import {
  REFERRAL_COMMISSION_MONTHS,
  REFERRAL_COMMISSION_PERCENT,
  REFERRAL_CONFIRM_AFTER_PAID_MONTHS,
  REFERRAL_PAY_DAY,
} from '@/lib/referralCode';

/** List prices (GBP) — keep aligned with stripe-server / pricing page. */
const PRICE_PER_VEHICLE_MONTHLY = 8;
const PRICE_PER_VEHICLE_YEARLY = 84;

export type ReferralPayment = {
  month: string;
  amountGbp?: number | null;
  paidAt?: string | null;
};

export type ReferralCashRow = {
  estimatedMonthlyGbp: number | null;
  monthsPaid: number;
  monthsRemaining: number;
  totalPaidGbp: number;
  nextPayDate: string | null;
  stopsAfterMonth: string | null;
  confirmAfterPaidMonths: number;
  commissionPercent: number;
  commissionMonths: number;
  payDay: number;
  eligibilityNote: string;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Next calendar occurrence of the pay day (15th) on or after `from`. */
export function nextPayDateOnOrAfter(from = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), REFERRAL_PAY_DAY, 12, 0, 0, 0);
  if (
    from.getDate() > REFERRAL_PAY_DAY ||
    (from.getDate() === REFERRAL_PAY_DAY && from.getHours() >= 12)
  ) {
    return new Date(from.getFullYear(), from.getMonth() + 1, REFERRAL_PAY_DAY, 12, 0, 0, 0);
  }
  return d;
}

export function formatUkDate(d: Date | null): string | null {
  if (!d || Number.isNaN(d.getTime())) return null;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function addMonthsKey(month: string, add: number): string {
  const [y, m] = month.split('-').map(Number);
  const dt = new Date(y, m - 1 + add, 1);
  return monthKey(dt);
}

/**
 * Monthly amount the referred firm actually pays (after discounts).
 * Prefer an explicit monthly figure; otherwise derive from slots + billing cycle
 * (annual ÷ 12). Never uses slots × £8 alone when yearly.
 */
export function referredFirmMonthlyAmountGbp(input: {
  monthlyAmountGbp?: number | null;
  subscribedVehicles?: number | null;
  billingCycle?: string | null;
}): number | null {
  if (
    input.monthlyAmountGbp != null &&
    Number.isFinite(input.monthlyAmountGbp) &&
    input.monthlyAmountGbp > 0
  ) {
    return Math.round(input.monthlyAmountGbp * 100) / 100;
  }
  const slots = input.subscribedVehicles;
  if (slots == null || !Number.isFinite(slots) || slots < 1) return null;
  const cycle = (input.billingCycle || '').toLowerCase();
  if (cycle === 'yearly' || cycle === 'annual' || cycle === 'year') {
    return Math.round(((slots * PRICE_PER_VEHICLE_YEARLY) / 12) * 100) / 100;
  }
  return Math.round(slots * PRICE_PER_VEHICLE_MONTHLY * 100) / 100;
}

/** 30% of the firm's actual monthly amount. */
export function estimateMonthlyCommissionGbp(input: {
  monthlyAmountGbp?: number | null;
  subscribedVehicles?: number | null;
  billingCycle?: string | null;
}): number | null {
  const bill = referredFirmMonthlyAmountGbp(input);
  if (bill == null) return null;
  return Math.round(bill * (REFERRAL_COMMISSION_PERCENT / 100) * 100) / 100;
}

export function totalPaidFromPayments(payments?: ReferralPayment[] | null): number {
  if (!Array.isArray(payments)) return 0;
  let sum = 0;
  for (const p of payments) {
    if (typeof p.amountGbp === 'number' && Number.isFinite(p.amountGbp)) {
      sum += p.amountGbp;
    }
  }
  return Math.round(sum * 100) / 100;
}

export function buildReferralCashWorkings(input: {
  status?: string;
  payments?: ReferralPayment[];
  monthlyAmountGbp?: number | null;
  subscribedVehicles?: number | null;
  billingCycle?: string | null;
  subscriptionStatus?: string | null;
  confirmedAt?: Date | null;
}): ReferralCashRow {
  const payments = Array.isArray(input.payments) ? input.payments : [];
  const monthsPaid = payments.length;
  const totalPaidGbp = totalPaidFromPayments(payments);
  const estimatedMonthlyGbp = estimateMonthlyCommissionGbp({
    monthlyAmountGbp: input.monthlyAmountGbp,
    subscribedVehicles: input.subscribedVehicles,
    billingCycle: input.billingCycle,
  });
  const status = (input.status || 'pending').toLowerCase();

  let eligibilityNote = '';
  if (status === 'unrecognised') {
    eligibilityNote = 'Code not recognised — match to a referrer before confirming.';
  } else if (status === 'pending') {
    eligibilityNote = `Confirm after the customer has ${REFERRAL_CONFIRM_AFTER_PAID_MONTHS} paid months. Then pay ${REFERRAL_COMMISSION_PERCENT}% of what they pay for up to ${REFERRAL_COMMISSION_MONTHS} months on the ${REFERRAL_PAY_DAY}th.`;
  } else if (status === 'stopped') {
    eligibilityNote = 'Stopped — no further payouts.';
  } else if (status === 'completed') {
    eligibilityNote = `Completed — ${REFERRAL_COMMISSION_MONTHS} commission months recorded.`;
  } else {
    eligibilityNote = `Active — pay ${REFERRAL_COMMISSION_PERCENT}% of what the firm actually pays, on the ${REFERRAL_PAY_DAY}th.`;
  }

  const monthsRemaining = Math.max(0, REFERRAL_COMMISSION_MONTHS - monthsPaid);
  const nextPay =
    status === 'active' || status === 'confirmed'
      ? formatUkDate(nextPayDateOnOrAfter(new Date()))
      : null;

  let stopsAfterMonth: string | null = null;
  if (monthsPaid > 0) {
    const first = [...payments].map((p) => p.month).filter(Boolean).sort()[0];
    if (first) stopsAfterMonth = addMonthsKey(first, REFERRAL_COMMISSION_MONTHS - 1);
  } else if (input.confirmedAt) {
    stopsAfterMonth = addMonthsKey(monthKey(input.confirmedAt), REFERRAL_COMMISSION_MONTHS - 1);
  }

  return {
    estimatedMonthlyGbp,
    monthsPaid,
    monthsRemaining,
    totalPaidGbp,
    nextPayDate: status === 'stopped' || status === 'completed' ? null : nextPay,
    stopsAfterMonth,
    confirmAfterPaidMonths: REFERRAL_CONFIRM_AFTER_PAID_MONTHS,
    commissionPercent: REFERRAL_COMMISSION_PERCENT,
    commissionMonths: REFERRAL_COMMISSION_MONTHS,
    payDay: REFERRAL_PAY_DAY,
    eligibilityNote,
  };
}
