import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getStripePlantPriceId, MIN_PLANT_MACHINES, type PlantBillingCycle } from '@/lib/stripe-server';
import { getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import {
  getCheckoutBaseUrl,
  isAllowedCheckoutOrigin,
  verifyManagerCheckout,
} from '@/lib/checkout-request';
import { PLANT_STRIPE_PRODUCT_METADATA } from '@/lib/stripe-plant-billing';
import { MAX_PLANT_MACHINES } from '@/lib/plant/constants';

export const maxDuration = 60;

const CHECKOUT_WINDOW_MS = 60 * 1000;
const CHECKOUT_MAX_REQUESTS = 10;

function getPlantSuccessPath(): string {
  return process.env.NEXT_PUBLIC_PLANT_SUCCESS_PATH || '/return/plant-success';
}

function getPlantCancelPath(): string {
  return process.env.NEXT_PUBLIC_PLANT_CANCEL_PATH || '/return/plant-cancel';
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedCheckoutOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (!rateLimit(ip, 'plant-checkout', CHECKOUT_WINDOW_MS, CHECKOUT_MAX_REQUESTS)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { machine_count, company_id: companyId, billing_cycle } = body as {
      machine_count?: number;
      company_id?: string;
      billing_cycle?: string;
    };

    if (!companyId || typeof companyId !== 'string') {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }

    const verified = await verifyManagerCheckout(request, companyId);
    if (verified instanceof NextResponse) return verified;

    const machineCount = Number(machine_count);
    if (
      !machineCount ||
      machineCount < MIN_PLANT_MACHINES ||
      machineCount > MAX_PLANT_MACHINES ||
      !Number.isInteger(machineCount)
    ) {
      return NextResponse.json(
        {
          error: 'minimum_three_machines',
          message: `machine_count must be a whole number between ${MIN_PLANT_MACHINES} and ${MAX_PLANT_MACHINES}.`,
        },
        { status: 400 }
      );
    }

    const cycle: PlantBillingCycle = billing_cycle === 'yearly' ? 'yearly' : 'monthly';

    const companySnap = await getAdminDb().collection('companies').doc(verified.companyId).get();
    const companyData = companySnap.exists ? companySnap.data() : null;

    const hasActivePlant =
      companyData?.has_plant_module === true &&
      (companyData.plant_module_status === 'active' ||
        companyData.plant_module_status === 'past_due');

    if (hasActivePlant) {
      return NextResponse.json(
        {
          error:
            'Plant module is already active. Change machine quantity in the Stripe billing portal (Subscription page), or contact support.',
        },
        { status: 400 }
      );
    }

    let priceId: string;
    try {
      priceId = getStripePlantPriceId(cycle);
    } catch (priceError) {
      return NextResponse.json(
        {
          error:
            priceError instanceof Error ? priceError.message : 'Plant price not configured',
        },
        { status: 500 }
      );
    }

    const baseUrl = getCheckoutBaseUrl();
    const successUrl = `${baseUrl}${getPlantSuccessPath()}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}${getPlantCancelPath()}`;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: machineCount }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(verified.stripeCustomerId && { customer: verified.stripeCustomerId }),
      metadata: {
        company_id: verified.companyId,
        machine_count: String(machineCount),
        billing_cycle: cycle,
        product: PLANT_STRIPE_PRODUCT_METADATA,
      },
      subscription_data: {
        metadata: {
          company_id: verified.companyId,
          machine_count: String(machineCount),
          billing_cycle: cycle,
          product: PLANT_STRIPE_PRODUCT_METADATA,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[Plant checkout] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
