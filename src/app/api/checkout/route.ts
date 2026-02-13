import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getStripePriceId, type SubscriptionTier } from '@/lib/stripe-server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Increase timeout for Vercel (max 60s on Pro, 10s on Hobby)
export const maxDuration = 60;

const VALID_TIERS: SubscriptionTier[] = ['PRO_STARTER', 'PRO_TEAM', 'PRO_BUSINESS', 'PRO_ENTERPRISE'];

const CHECKOUT_WINDOW_MS = 60 * 1000; // 1 minute
const CHECKOUT_MAX_REQUESTS = 10;

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (url && url.trim()) {
    const trimmed = url.trim();
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  }
  // Default fallback - but warn if not set
  console.warn('NEXT_PUBLIC_APP_URL not set, using default. Set this in environment variables.');
  return 'https://stocktrackpro.co.uk';
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
  const startTime = Date.now();
  try {
    console.log('[Checkout] Request started');
    
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
    const { tier, company_id: companyId, promo_code } = body as { tier?: string; company_id?: string; promo_code?: string };

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

    console.log('[Checkout] Fetching profile for uid:', uid);
    // Initialize Firebase Admin early (may be slow on cold start)
    const dbStart = Date.now();
    const db = getAdminDb();
    console.log('[Checkout] Firebase Admin initialized in', Date.now() - dbStart, 'ms');
    
    const profileSnap = await db.collection('profiles').doc(uid).get();
    if (!profileSnap.exists) {
      console.error('[Checkout] Profile not found for uid:', uid);
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }
    const profile = profileSnap.data();
    const profileCompanyId = profile?.company_id;
    const role = profile?.role;
    console.log('[Checkout] Profile loaded:', { company_id: profileCompanyId, role });
    
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
    
    // Validate URLs are absolute
    if (!successUrl.startsWith('http://') && !successUrl.startsWith('https://')) {
      console.error('Invalid success URL:', successUrl);
      return NextResponse.json(
        { error: 'Invalid success URL configuration' },
        { status: 500 }
      );
    }
    if (!cancelUrl.startsWith('http://') && !cancelUrl.startsWith('https://')) {
      console.error('Invalid cancel URL:', cancelUrl);
      return NextResponse.json(
        { error: 'Invalid cancel URL configuration' },
        { status: 500 }
      );
    }

    let priceId: string;
    try {
      priceId = getStripePriceId(tier as SubscriptionTier);
    } catch (priceError) {
      console.error('Price ID error:', priceError);
      return NextResponse.json(
        { error: priceError instanceof Error ? priceError.message : 'Invalid price configuration' },
        { status: 500 }
      );
    }

    // Validate price ID format (Stripe price IDs start with price_)
    if (!priceId.startsWith('price_')) {
      console.error('Invalid price ID format:', priceId);
      return NextResponse.json(
        { error: 'Invalid price ID format. Price IDs must start with "price_".' },
        { status: 500 }
      );
    }

    // Log configuration for debugging
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    const isLiveMode = secretKey.startsWith('sk_live_');
    console.log('[Checkout] Configuration:', {
      mode: isLiveMode ? 'LIVE' : 'TEST',
      tier,
      priceId,
      baseUrl,
      successUrl,
      cancelUrl,
      companyId: companyId.trim(),
    });

    // Validate metadata values (Stripe requires strings, max 500 chars each)
    const trimmedCompanyId = companyId.trim();
    if (trimmedCompanyId.length > 500) {
      return NextResponse.json(
        { error: 'Company ID too long for Stripe metadata' },
        { status: 400 }
      );
    }
    if (tier.length > 500) {
      return NextResponse.json(
        { error: 'Tier value too long for Stripe metadata' },
        { status: 400 }
      );
    }

    // Check if company is new (hasn't had a Stripe subscription before)
    // Apply 7-day free trial for new companies
    const companySnap = await db.collection('companies').doc(trimmedCompanyId).get();
    const companyData = companySnap.exists ? companySnap.data() : null;
    const hasPreviousStripeSubscription = companyData?.stripe_subscription_id != null;
    const isNewCompany = !hasPreviousStripeSubscription && 
      (companyData?.subscription_status === 'trial' || companyData?.subscription_status == null);
    
    // Validate promo code if provided
    let stripePromoCode: string | undefined = undefined;
    if (promo_code && promo_code.trim()) {
      const trimmedPromoCode = promo_code.trim().toUpperCase();
      try {
        const promoCodeSnap = await db.collection('promoCodes').doc(trimmedPromoCode).get();
        if (!promoCodeSnap.exists) {
          return NextResponse.json(
            { error: 'Invalid promo code' },
            { status: 400 }
          );
        }
        const promoData = promoCodeSnap.data();
        
        // Check if promo code has a tier restriction and validate it matches requested tier
        if (promoData?.tier && promoData.tier !== tier) {
          return NextResponse.json(
            { error: `This promo code is only valid for the ${promoData.tier} plan` },
            { status: 400 }
          );
        }
        
        // Check if code is expired
        if (promoData?.expiresAt) {
          const expiresAt = promoData.expiresAt.toDate ? promoData.expiresAt.toDate() : new Date(promoData.expiresAt);
          if (expiresAt < new Date()) {
            return NextResponse.json(
              { error: 'This promo code has expired' },
              { status: 400 }
            );
          }
        }
        
        // Check if code has reached max uses
        if (promoData?.maxUses && promoData?.usedCount >= promoData.maxUses) {
          return NextResponse.json(
            { error: 'This promo code has reached its usage limit' },
            { status: 400 }
          );
        }
        
        // Check if code is already used (single-use codes)
        if (promoData?.used === true && !promoData?.maxUses) {
          return NextResponse.json(
            { error: 'This promo code has already been used' },
            { status: 400 }
          );
        }
        
        // Use the promo code ID as the Stripe coupon/promo code
        // Note: Stripe promo codes are created in Stripe dashboard and referenced by ID
        // For now, we'll store the promo code in metadata and handle discount in webhook
        stripePromoCode = trimmedPromoCode;
        console.log('[Checkout] Valid promo code:', trimmedPromoCode);
      } catch (promoError: any) {
        console.error('[Checkout] Error validating promo code:', promoError);
        return NextResponse.json(
          { error: 'Failed to validate promo code. Please try again.' },
          { status: 500 }
        );
      }
    }
    
    console.log('[Checkout] Company subscription status:', {
      companyId: trimmedCompanyId,
      subscription_status: companyData?.subscription_status,
      stripe_subscription_id: companyData?.stripe_subscription_id,
      isNewCompany,
      willApplyTrial: isNewCompany,
      promoCode: stripePromoCode || null,
    });

    const stripe = getStripe();
    let session;
    try {
      const sessionParams: any = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          company_id: trimmedCompanyId,
          tier: tier,
          ...(stripePromoCode && { promo_code: stripePromoCode }),
        },
        subscription_data: {
          metadata: {
            company_id: trimmedCompanyId,
            tier: tier,
            ...(stripePromoCode && { promo_code: stripePromoCode }),
          },
          // Apply 7-day free trial for new companies
          ...(isNewCompany && { trial_period_days: 7 }),
        },
      };
      
      // If promo code is provided, add it to allow_promotion_codes
      // Note: Stripe Checkout supports promotion codes via allow_promotion_codes: true
      // or by specifying discounts. For custom promo codes stored in Firestore,
      // we'll handle the discount in the webhook after subscription creation.
      if (stripePromoCode) {
        // Store promo code in metadata - webhook will apply discount
        sessionParams.allow_promotion_codes = false; // We handle custom codes via webhook
      }
      
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (stripeError: any) {
      console.error('Stripe API error:', {
        message: stripeError?.message,
        type: stripeError?.type,
        code: stripeError?.code,
        param: stripeError?.param,
        priceId,
        successUrl,
        cancelUrl,
      });
      // Return more specific error message
      const errorMessage = stripeError?.message || 'Stripe checkout failed';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log('[Checkout] Success, duration:', duration, 'ms');
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error('[Checkout] Error after', duration, 'ms:', err);
    
    // Handle timeout specifically
    if (err instanceof Error && (err.message.includes('timeout') || err.message.includes('504'))) {
      return NextResponse.json(
        { error: 'Request timed out. Please try again. If this persists, check your Vercel function timeout settings.' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
