import { NextRequest, NextResponse } from 'next/server';
import { stripe, getStripePriceId, type SubscriptionTier } from '@/lib/stripe-server';

const VALID_TIERS: SubscriptionTier[] = ['PRO_STARTER', 'PRO_TEAM', 'PRO_BUSINESS', 'PRO_ENTERPRISE'];

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (url) {
    return url.startsWith('http') ? url : `https://${url}`;
  }
  return 'https://www.stocktrackpro.co.uk';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, company_id: companyId } = body as { tier?: string; company_id?: string };

    if (!tier || !VALID_TIERS.includes(tier as SubscriptionTier)) {
      return NextResponse.json(
        { error: 'Invalid or missing tier' },
        { status: 400 }
      );
    }
    if (!companyId || typeof companyId !== 'string' || companyId.trim() === '') {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl();
    const priceId = getStripePriceId(tier as SubscriptionTier);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/return/subscription-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/return/subscription-cancel.html`,
      metadata: {
        company_id: companyId.trim(),
        tier,
      },
      subscription_data: {
        metadata: {
          company_id: companyId.trim(),
          tier,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
