/**
 * Short billing points that mirror Subscription Terms (trial, cancel, annual renewal, pricing model).
 * Keep in sync with /subscription-terms/. Annual copy is “switch off renewal”, not a denial of renewal.
 */
export const BILLING_REASSURANCE_HEADING = 'No surprises on billing';

export const BILLING_REASSURANCE_ITEMS = [
  '14-day free trial, no card needed',
  'Monthly plans: cancel anytime from Manage Billing — no long-term contract',
  'Annual plans: paid upfront for 12 months; you can switch off renewal at any time',
  'No setup fees · price per vehicle, not per user',
] as const;

export const BILLING_REASSURANCE_TERMS_HREF = '/subscription-terms/';
export const BILLING_REASSURANCE_TERMS_LABEL = 'Read the subscription terms';
