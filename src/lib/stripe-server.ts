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

export type SubscriptionTier = 'PRO_STARTER' | 'PRO_TEAM' | 'PRO_BUSINESS' | 'PRO_ENTERPRISE';

const TIER_TO_PRICE_KEY: Record<SubscriptionTier, string> = {
  PRO_STARTER: 'STRIPE_PRICE_STARTER',
  PRO_TEAM: 'STRIPE_PRICE_TEAM',
  PRO_BUSINESS: 'STRIPE_PRICE_BUSINESS',
  PRO_ENTERPRISE: 'STRIPE_PRICE_ENTERPRISE',
};

export function getStripePriceId(tier: SubscriptionTier): string {
  const key = TIER_TO_PRICE_KEY[tier];
  const priceId = process.env[key];
  if (!priceId) {
    throw new Error(`Missing env: ${key} for tier ${tier}`);
  }
  return priceId;
}
