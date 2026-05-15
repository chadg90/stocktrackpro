import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe-server';
import { getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
const WEBHOOK_WINDOW_MS = 60 * 1000;
const WEBHOOK_MAX_REQUESTS = 120; // Stripe may retry

const PROCESSED_EVENTS_COLLECTION = 'stripe_webhook_events';

async function alreadyProcessed(db: ReturnType<typeof getAdminDb>, eventId: string): Promise<boolean> {
  const ref = db.collection(PROCESSED_EVENTS_COLLECTION).doc(eventId);
  const snap = await ref.get();
  return snap.exists;
}

async function markProcessed(db: ReturnType<typeof getAdminDb>, eventId: string): Promise<void> {
  await db.collection(PROCESSED_EVENTS_COLLECTION).doc(eventId).set({
    processed_at: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 'stripe-webhook', WEBHOOK_WINDOW_MS, WEBHOOK_MAX_REQUESTS)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      console.error('Stripe webhook signature verification failed:', message);
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const db = getAdminDb();

    // Idempotency: skip if we already processed this event (Stripe retries)
    const eventId = event.id;
    if (await alreadyProcessed(db, eventId)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string | null;
        const companyId = session.metadata?.company_id;
        const vehicleCountRaw = session.metadata?.vehicle_count;
        const billingCycleMeta = session.metadata?.billing_cycle;

        if (!subscriptionId || !companyId) {
          console.warn('Stripe webhook: checkout.session.completed missing subscription_id or company_id');
          break;
        }

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const status = subscription.status;
        const intervalFromPrice = subscription.items?.data?.[0]?.price?.recurring?.interval;
        const billingCycle: 'monthly' | 'yearly' =
          intervalFromPrice === 'year'
            ? 'yearly'
            : intervalFromPrice === 'month'
              ? 'monthly'
              : billingCycleMeta === 'yearly' ? 'yearly' : 'monthly';

        let firebaseStatus: string;
        if (status === 'trialing') {
          firebaseStatus = 'trial';
        } else if (status === 'active') {
          firebaseStatus = 'active';
        } else {
          firebaseStatus = status;
        }

        const periodEnd = subscription.current_period_end;
        const expiryDate = periodEnd ? new Date(periodEnd * 1000).toISOString().split('T')[0] : null;
        const trialEnd = subscription.trial_end;
        const trialEndDate = trialEnd ? new Date(trialEnd * 1000) : null;
        const subscribedVehicles = vehicleCountRaw ? parseInt(vehicleCountRaw, 10) : null;

        await db.collection('companies').doc(companyId).set(
          {
            subscription_status: firebaseStatus,
            subscription_type: 'stripe',
            billing_cycle: billingCycle,
            ...(subscribedVehicles && { subscribed_vehicles: subscribedVehicles }),
            ...(expiryDate && { subscription_expiry_date: expiryDate }),
            ...(trialEndDate && { trial_end_date: trialEndDate }),
            stripe_subscription_id: subscription.id,
            ...(customerId && { stripe_customer_id: customerId }),
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('Updated company', companyId, 'subscription from checkout.session.completed', { status: firebaseStatus, subscribedVehicles, billingCycle });
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string | null;
        if (!subscriptionId) break;

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const companyId = subscription.metadata?.company_id;
        const vehicleCountRaw = subscription.metadata?.vehicle_count;
        if (!companyId) {
          console.warn('Stripe webhook: invoice.paid missing company_id in subscription metadata');
          break;
        }

        const periodEnd = subscription.current_period_end;
        const expiryDate = periodEnd ? new Date(periodEnd * 1000).toISOString().split('T')[0] : null;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const subscribedVehicles = vehicleCountRaw ? parseInt(vehicleCountRaw, 10) : null;

        await db.collection('companies').doc(companyId).set(
          {
            subscription_status: 'active',
            subscription_type: 'stripe',
            ...(subscribedVehicles && { subscribed_vehicles: subscribedVehicles }),
            ...(expiryDate && { subscription_expiry_date: expiryDate }),
            stripe_subscription_id: subscription.id,
            ...(customerId && { stripe_customer_id: customerId }),
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('Updated company', companyId, 'subscription to active (invoice.paid)', { subscribedVehicles });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata?.company_id;
        const vehicleCountRaw = subscription.metadata?.vehicle_count;
        if (!companyId) break;

        const status = subscription.status;
        const intervalFromPrice = subscription.items?.data?.[0]?.price?.recurring?.interval;
        const billingCycle: 'monthly' | 'yearly' | null =
          intervalFromPrice === 'year' ? 'yearly' : intervalFromPrice === 'month' ? 'monthly' : null;
        
        // Map Stripe status to Firebase status
        let firebaseStatus: string;
        if (status === 'trialing') {
          firebaseStatus = 'trial';
        } else if (status === 'active') {
          firebaseStatus = 'active';
        } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
          firebaseStatus = 'inactive';
        } else {
          firebaseStatus = status;
        }
        
        const periodEnd = subscription.current_period_end;
        const expiryDate = periodEnd
          ? new Date(periodEnd * 1000).toISOString().split('T')[0]
          : null;
        
        const trialEnd = subscription.trial_end;
        const trialEndDate = trialEnd
          ? new Date(trialEnd * 1000)
          : null;
        
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const subscribedVehicles = vehicleCountRaw ? parseInt(vehicleCountRaw, 10) : null;

        await db.collection('companies').doc(companyId).set(
          {
            subscription_status: firebaseStatus,
            subscription_type: 'stripe',
            ...(billingCycle && { billing_cycle: billingCycle }),
            ...(subscribedVehicles && { subscribed_vehicles: subscribedVehicles }),
            ...(expiryDate && { subscription_expiry_date: expiryDate }),
            ...(trialEndDate && { trial_end_date: trialEndDate }),
            stripe_subscription_id: subscription.id,
            ...(customerId && { stripe_customer_id: customerId }),
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('Updated company', companyId, 'subscription (customer.subscription.updated)', { stripeStatus: status, firebaseStatus, subscribedVehicles, billingCycle });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata?.company_id;
        if (!companyId) break;

        await db.collection('companies').doc(companyId).set(
          {
            subscription_status: 'inactive',
            subscription_type: 'stripe',
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('Set company', companyId, 'subscription to inactive (customer.subscription.deleted)');
        break;
      }

      // ============================================
      // PLANT & MACHINERY MODULE EVENTS
      // ============================================

      case 'checkout.session.completed': {
        // Already handled above for core subscription — check if this is a plant add-on
        const session = event.data.object as Stripe.Checkout.Session;
        const checkoutType = session.metadata?.checkout_type;
        if (checkoutType !== 'plant_module_addon') break; // handled in core case above

        const companyId = session.metadata?.company_id;
        if (!companyId) break;

        await db.collection('organisations').doc(companyId).set(
          {
            has_plant_module: true,
            plant_module_status: 'active',
            plant_module_activated_at: new Date().toISOString(),
            plant_stripe_subscription_id: session.subscription ?? null,
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('Plant module activated for company', companyId, '(checkout.session.completed plant_module_addon)');
        break;
      }

      case 'invoice.payment_failed': {
        // Handles both core subscription and plant add-on payment failures
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string | null;
        if (!subscriptionId) break;

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const companyId = subscription.metadata?.company_id;
        const subscriptionType = subscription.metadata?.subscription_type;
        if (!companyId) break;

        if (subscriptionType === 'plant_module_addon') {
          // Suspend plant module on payment failure
          await db.collection('organisations').doc(companyId).set(
            {
              plant_module_status: 'inactive',
              updated_at: new Date().toISOString(),
            },
            { merge: true }
          );
          console.log('Plant module suspended for company', companyId, '(invoice.payment_failed)');
        } else {
          // Core subscription payment failed — set to inactive
          await db.collection('companies').doc(companyId).set(
            {
              subscription_status: 'inactive',
              updated_at: new Date().toISOString(),
            },
            { merge: true }
          );
          console.log('Set company', companyId, 'subscription to inactive (invoice.payment_failed)');
        }
        break;
      }

      default:
        break;
    }

    await markProcessed(db, eventId);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook failed' },
      { status: 500 }
    );
  }
}
