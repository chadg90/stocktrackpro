import type Stripe from 'stripe';

/** Soft caps for support/admin quantity changes (public checkout still uses MIN_VEHICLES=2). */
export const ADMIN_MIN_VEHICLES = 1;
export const ADMIN_MAX_VEHICLES = 500;

/**
 * Resolve how many vehicle slots Stripe is billing for.
 * Prefers subscription item quantity (what Stripe invoices). Falls back to metadata.
 */
export function resolveSubscribedVehicleQuantity(
  subscription: Stripe.Subscription,
  sessionOrExtraMetadata?: Stripe.Metadata | null
): number | null {
  const lineQuantity = subscription.items?.data?.[0]?.quantity;
  if (typeof lineQuantity === 'number' && Number.isInteger(lineQuantity) && lineQuantity > 0) {
    return lineQuantity;
  }

  const fromSubscriptionMeta = parsePositiveInt(subscription.metadata?.vehicle_count);
  if (fromSubscriptionMeta != null) return fromSubscriptionMeta;

  const fromExtra = parsePositiveInt(sessionOrExtraMetadata?.vehicle_count);
  if (fromExtra != null) return fromExtra;

  return null;
}

function parsePositiveInt(raw: string | null | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = parseInt(raw, 10);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function isValidAdminVehicleQuantity(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= ADMIN_MIN_VEHICLES &&
    value <= ADMIN_MAX_VEHICLES
  );
}
