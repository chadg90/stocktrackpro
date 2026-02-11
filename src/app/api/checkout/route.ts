import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getStripePriceId, type SubscriptionTier } from '@/lib/stripe-server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const VALID_TIERS: SubscriptionTier[] = ['PRO_STARTER', 'PRO_TEAM', 'PRO_BUSINESS', 'PRO_ENTERPRISE'];

const CHECKOUT_WINDOW_MS = 60 * 1000; // 1 minute
const CHECKOUT_MAX_REQUESTS = 10;

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (url) {
    return url.startsWith('http') ? url : `https://${url}`;
  }
  return 'https://stocktrackpro.com';
}

function getSuccessPath(): string {
  return process.env.NEXT_PUBLIC_SUBSCRIPTION_SUCCESS_PATH || '/return/subscription-success';
}

function getCancelPath(): string {
  return process.env.NEXT_PUBLIC_SUBSCRIPTION_CANCEL_PATH || '/return/subscription-cancel';
}

/** Allow only requests from our domain (Origin or Referer). */
function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stocktrackpro.com';
  const allowedHost = baseUrl.replace(/^https?:\/\//, '').split('/')[0];
  const allowedOrigins = [
    `https://${allowedHost}`,
    `http://${allowedHost}`,
    'https://www.stocktrackpro.co.uk',
    'https://stocktrackpro.co.uk',
    'https://www.stocktrackpro.com',
    'https://stocktrackpro.com',
  ];
  if (origin && allowedOrigins.some(o => origin === o || origin.startsWith(o + '/'))) return true;
  if (referer && allowedOrigins.some(o => referer.startsWith(o))) return true;
  // Server-side fetch (e.g. from same origin) may have no Origin/Referer
  return !origin && !referer;
}

export async function POST(request: NextRequest) {
  try {
    // CORS / referrer check
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting by IP
    const ip = getClientIp(request);
    if (!rateLimit(ip, 'checkout', CHECKOUT_WINDOW_MS, CHECKOUT_MAX_REQUESTS)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json(
        { error: 'Authorization required. Please log in and try again.' },
        { status: 401 }
      );
    }

    let uid: string;
    try {
      const auth = getAdminAuth();
      const decoded = await auth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired session. Please log in again.' },
        { status: 401 }
      );
    }

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

    const db = getAdminDb();
    const profileSnap = await db.collection('profiles').doc(uid).get();
    if (!profileSnap.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }
    const profile = profileSnap.data();
    const profileCompanyId = profile?.company_id;
    const role = profile?.role;
    const allowedRoles = ['manager', 'admin'];
    if (!profileCompanyId || profileCompanyId.trim() !== companyId.trim()) {
      return NextResponse.json(
        { error: 'You can only start checkout for your own company.' },
        { status: 403 }
      );
    }
    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Only managers and admins can start checkout.' },
        { status: 403 }
      );
    }

    const baseUrl = getBaseUrl();
    const successUrl = `${baseUrl}${getSuccessPath()}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}${getCancelPath()}`;
    const priceId = getStripePriceId(tier as SubscriptionTier);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
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
