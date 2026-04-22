import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/** Use this instead of a top-level stripe const so the build doesn't fail when STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(secret, { apiVersion: '2025-02-24.acacia' });
  }
  return stripeInstance;
}

export type SubscriptionTier = 'PRO_PER_VEHICLE';
export type BillingCycle = 'monthly' | 'yearly';

export function getStripePriceId(_tier: SubscriptionTier, cycle: BillingCycle = 'monthly'): string {
  const envVar = cycle === 'yearly' ? 'STRIPE_PRICE_PER_VEHICLE_YEARLY' : 'STRIPE_PRICE_PER_VEHICLE';
  const priceId = process.env[envVar];
  if (!priceId) {
    throw new Error(`Missing env: ${envVar}`);
  }
  return priceId;
}

export const MIN_VEHICLES = 5;
export const PRICE_PER_VEHICLE = 8; // GBP, monthly
export const PRICE_PER_VEHICLE_YEARLY = 84; // GBP per vehicle per year (~£7/mo, save ~12.5%)

/** Create a Stripe Customer Portal session for managing subscription. Requires company to have stripe_customer_id. */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
  configurationId?: string
): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    ...(configurationId && { configuration: configurationId }),
  });
  if (!session.url) throw new Error('No portal URL');
  return session.url;
}
