import type Stripe from 'stripe';

/** Soft caps for support/admin quantity changes (public checkout still uses MIN_VEHICLES=2). */
export const ADMIN_MIN_VEHICLES = 1;
export const ADMIN_MAX_VEHICLES = 500;

function parsePositiveInt(raw: string | null | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = parseInt(raw, 10);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function fleetPriceIdSet(): Set<string> {
  return new Set(
    [process.env.STRIPE_PRICE_PER_VEHICLE, process.env.STRIPE_PRICE_PER_VEHICLE_YEARLY].filter(
      (id): id is string => typeof id === 'string' && id.length > 0
    )
  );
}

function deliveryPriceIdSet(): Set<string> {
  return new Set(
    [process.env.STRIPE_PRICE_DELIVERY_MONTHLY, process.env.STRIPE_PRICE_DELIVERY_YEARLY].filter(
      (id): id is string => typeof id === 'string' && id.length > 0
    )
  );
}

/**
 * Resolve how many vehicle slots Stripe is billing for (fleet line only).
 * Prefers the subscription item whose price is a known fleet price ID.
 * Falls back to first non-delivery item, then metadata — never a Delivery price.
 */
export function resolveSubscribedVehicleQuantity(
  subscription: Stripe.Subscription,
  sessionOrExtraMetadata?: Stripe.Metadata | null
): number | null {
  const fleetIds = fleetPriceIdSet();
  const deliveryIds = deliveryPriceIdSet();
  const items = subscription.items?.data || [];

  const fleetItem =
    items.find((item) => item.price?.id && fleetIds.has(item.price.id)) ||
    items.find((item) => item.price?.id && !deliveryIds.has(item.price.id));

  const lineQuantity = fleetItem?.quantity;
  if (typeof lineQuantity === 'number' && Number.isInteger(lineQuantity) && lineQuantity > 0) {
    return lineQuantity;
  }

  // Legacy single-item subs: only use items[0] if it is not a Delivery price.
  const first = items[0];
  if (
    first &&
    typeof first.quantity === 'number' &&
    Number.isInteger(first.quantity) &&
    first.quantity > 0 &&
    !(first.price?.id && deliveryIds.has(first.price.id))
  ) {
    return first.quantity;
  }

  const fromSubscriptionMeta = parsePositiveInt(subscription.metadata?.vehicle_count);
  if (fromSubscriptionMeta != null) return fromSubscriptionMeta;

  const fromExtra = parsePositiveInt(sessionOrExtraMetadata?.vehicle_count);
  if (fromExtra != null) return fromExtra;

  return null;
}

/** Delivery add-on line quantity (mirrors fleet when active). */
export function resolveDeliveryVehicleQuantity(
  subscription: Stripe.Subscription
): { quantity: number; itemId: string } | null {
  const deliveryIds = deliveryPriceIdSet();
  if (deliveryIds.size === 0) return null;
  const item = (subscription.items?.data || []).find(
    (i) => i.price?.id && deliveryIds.has(i.price.id)
  );
  if (!item || typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1) {
    return null;
  }
  return { quantity: item.quantity, itemId: item.id };
}

export function isValidAdminVehicleQuantity(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= ADMIN_MIN_VEHICLES &&
    value <= ADMIN_MAX_VEHICLES
  );
}
