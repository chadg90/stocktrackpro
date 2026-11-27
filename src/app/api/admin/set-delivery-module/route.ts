import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { getStripe, getStripeDeliveryPriceId } from '@/lib/stripe-server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import {
  DELIVERY_DEFAULT_TRIAL_DAYS,
  type DeliveryModuleStatus,
} from '@/lib/deliveryModule';

export const runtime = 'nodejs';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

type Action = 'start_trial' | 'extend_trial' | 'end_trial' | 'convert_paid' | 'cancel_paid';

/**
 * Platform admin: manage Delivery add-on trial / paid / cancel for a company.
 * Never writes modules from the client — Admin SDK only.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 'admin-set-delivery-module', WINDOW_MS, MAX_REQUESTS)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    let uid: string;
    let auth;
    try {
      auth = getAdminAuth();
    } catch (err) {
      console.error('Admin set-delivery-module admin init failed:', err);
      return NextResponse.json(
        { error: 'Server auth is not configured. Check FIREBASE_SERVICE_ACCOUNT_JSON in .env.local.' },
        { status: 500 }
      );
    }
    try {
      const decoded = await auth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch (err) {
      console.error('Admin set-delivery-module token verify failed:', err);
      return NextResponse.json(
        {
          error: 'Invalid or expired session. Sign out and sign back in, then try again.',
        },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const profileSnap = await db.collection('profiles').doc(uid).get();
    const role = profileSnap.exists ? String(profileSnap.data()?.role || '').toLowerCase() : '';
    if (!profileSnap.exists || role !== 'admin') {
      return NextResponse.json({ error: 'Only platform admins can manage Delivery module' }, { status: 403 });
    }

    let body: {
      company_id?: string;
      action?: Action;
      trial_days?: number;
      extend_days?: number;
      job_cap?: number | null;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const companyId = typeof body.company_id === 'string' ? body.company_id.trim() : '';
    const action = body.action;
    if (!companyId) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }
    if (
      !action ||
      !['start_trial', 'extend_trial', 'end_trial', 'convert_paid', 'cancel_paid'].includes(action)
    ) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const companyRef = db.collection('companies').doc(companyId);
    const companySnap = await companyRef.get();
    if (!companySnap.exists) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    const company = companySnap.data() || {};
    const previous = (company.modules && company.modules.delivery) || null;
    const now = new Date();
    const nowIso = now.toISOString();

    let nextStatus: DeliveryModuleStatus = previous?.status || 'cancelled';
    let trialEndsAt: string | null = previous?.trialEndsAt ?? null;
    let stripeItemId: string | null = previous?.stripe_subscription_item_id ?? null;
    let vehicleQuantity: number | null = previous?.vehicleQuantity ?? null;
    let currentPeriodEnd: string | null = previous?.currentPeriodEnd ?? null;
    const jobCap =
      body.job_cap === null
        ? null
        : typeof body.job_cap === 'number' && Number.isInteger(body.job_cap) && body.job_cap > 0
          ? body.job_cap
          : (previous?.jobCap ?? null);

    if (action === 'start_trial') {
      const days =
        typeof body.trial_days === 'number' && body.trial_days > 0 && body.trial_days <= 365
          ? Math.floor(body.trial_days)
          : DELIVERY_DEFAULT_TRIAL_DAYS;
      const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      nextStatus = 'trial';
      trialEndsAt = end.toISOString();
      // Do not attach Stripe on trial
    } else if (action === 'extend_trial') {
      if (previous?.status !== 'trial' && previous?.status !== 'expired') {
        return NextResponse.json({ error: 'Company is not on a Delivery trial' }, { status: 400 });
      }
      const days =
        typeof body.extend_days === 'number' && body.extend_days > 0 && body.extend_days <= 365
          ? Math.floor(body.extend_days)
          : 14;
      const base =
        trialEndsAt && Date.parse(trialEndsAt) > now.getTime()
          ? new Date(trialEndsAt)
          : now;
      trialEndsAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      nextStatus = 'trial';
    } else if (action === 'end_trial') {
      nextStatus = 'cancelled';
      trialEndsAt = trialEndsAt || nowIso;
    } else if (action === 'convert_paid') {
      const slots = Number(company.subscribed_vehicles);
      const qty = Number.isInteger(slots) && slots > 0 ? slots : null;
      if (qty == null) {
        return NextResponse.json(
          {
            error:
              'Company has no subscribed_vehicles. Set fleet slots first, or use trial until billing is ready.',
          },
          { status: 400 }
        );
      }
      const subscriptionId =
        typeof company.stripe_subscription_id === 'string' ? company.stripe_subscription_id : null;
      if (!subscriptionId) {
        return NextResponse.json(
          {
            error:
              'No Stripe subscription on this company. Attach a fleet subscription first, or keep them on Delivery trial.',
          },
          { status: 400 }
        );
      }

      const stripe = getStripe();
      const priceId = getStripeDeliveryPriceId('monthly');
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const existingDelivery = sub.items.data.find((item) => item.price?.id === priceId);

      if (existingDelivery) {
        await stripe.subscriptionItems.update(existingDelivery.id, {
          quantity: qty,
          proration_behavior: 'none',
        });
        stripeItemId = existingDelivery.id;
      } else {
        const created = await stripe.subscriptionItems.create({
          subscription: subscriptionId,
          price: priceId,
          quantity: qty,
          proration_behavior: 'none',
        });
        stripeItemId = created.id;
      }

      nextStatus = 'active';
      vehicleQuantity = qty;
      if (sub.current_period_end) {
        currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
      }
      trialEndsAt = null;
    } else if (action === 'cancel_paid') {
      if (stripeItemId) {
        try {
          const stripe = getStripe();
          await stripe.subscriptionItems.del(stripeItemId, { proration_behavior: 'none' });
        } catch (err) {
          console.warn('Delivery item delete failed (may already be removed)', err);
        }
      } else if (company.stripe_subscription_id) {
        try {
          const stripe = getStripe();
          const priceId = getStripeDeliveryPriceId('monthly');
          const sub = await stripe.subscriptions.retrieve(company.stripe_subscription_id);
          const item = sub.items.data.find((i) => i.price?.id === priceId);
          if (item) {
            await stripe.subscriptionItems.del(item.id, { proration_behavior: 'none' });
          }
        } catch (err) {
          console.warn('Delivery cancel lookup failed', err);
        }
      }
      nextStatus = 'cancelled';
      stripeItemId = null;
      vehicleQuantity = null;
    }

    const deliveryPayload = {
      status: nextStatus,
      trialEndsAt,
      currentPeriodEnd,
      vehicleQuantity,
      stripe_subscription_item_id: stripeItemId,
      jobCap,
      updated_at: nowIso,
    };

    await companyRef.set(
      {
        modules: {
          ...(company.modules || {}),
          delivery: deliveryPayload,
        },
        updated_at: nowIso,
      },
      { merge: true }
    );

    await db.collection('admin_audit_logs').add({
      action: `delivery_module_${action}`,
      admin_uid: uid,
      company_id: companyId,
      company_name: company.name || null,
      previous,
      next: deliveryPayload,
      at: nowIso,
    });

    return NextResponse.json({
      ok: true,
      company_id: companyId,
      delivery: deliveryPayload,
      message:
        action === 'convert_paid'
          ? 'Delivery add-on is active. Stripe quantity matches subscribed vehicles (no mid-cycle proration).'
          : action === 'start_trial' || action === 'extend_trial'
            ? 'Delivery trial updated. No Stripe charge.'
            : 'Delivery module updated.',
    });
  } catch (err) {
    console.error('Admin set-delivery-module error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update Delivery module' },
      { status: 500 }
    );
  }
}
