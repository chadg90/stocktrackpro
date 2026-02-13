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
        const tier = session.metadata?.tier;
        
        if (!subscriptionId || !companyId) {
          console.warn('Stripe webhook: checkout.session.completed missing subscription_id or company_id');
          break;
        }

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const status = subscription.status;
        
        // Determine subscription status: 'trialing' -> 'trial', 'active' -> 'active', etc.
        let firebaseStatus: string;
        if (status === 'trialing') {
          firebaseStatus = 'trial';
        } else if (status === 'active') {
          firebaseStatus = 'active';
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

        await db.collection('companies').doc(companyId).set(
          {
            subscription_status: firebaseStatus,
            subscription_type: 'stripe',
            ...(tier && { subscription_tier: tier }),
            ...(expiryDate && { subscription_expiry_date: expiryDate }),
            ...(trialEndDate && { trial_end_date: trialEndDate }),
            stripe_subscription_id: subscription.id,
            ...(customerId && { stripe_customer_id: customerId }),
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('Updated company', companyId, 'subscription from checkout.session.completed', { status: firebaseStatus, tier });
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string | null;
        if (!subscriptionId) break;

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const companyId = subscription.metadata?.company_id;
        const tier = subscription.metadata?.tier;
        if (!companyId) {
          console.warn('Stripe webhook: invoice.paid missing company_id in subscription metadata');
          break;
        }

        const periodEnd = subscription.current_period_end;
        const expiryDate = periodEnd
          ? new Date(periodEnd * 1000).toISOString().split('T')[0]
          : null;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

        await db.collection('companies').doc(companyId).set(
          {
            subscription_status: 'active',
            subscription_type: 'stripe',
            ...(tier && { subscription_tier: tier }),
            ...(expiryDate && { subscription_expiry_date: expiryDate }),
            stripe_subscription_id: subscription.id,
            ...(customerId && { stripe_customer_id: customerId }),
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('Updated company', companyId, 'subscription to active (invoice.paid)');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata?.company_id;
        const tier = subscription.metadata?.tier;
        if (!companyId) break;

        const status = subscription.status;
        
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

        await db.collection('companies').doc(companyId).set(
          {
            subscription_status: firebaseStatus,
            subscription_type: 'stripe',
            ...(tier && { subscription_tier: tier }),
            ...(expiryDate && { subscription_expiry_date: expiryDate }),
            ...(trialEndDate && { trial_end_date: trialEndDate }),
            stripe_subscription_id: subscription.id,
            ...(customerId && { stripe_customer_id: customerId }),
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('Updated company', companyId, 'subscription (customer.subscription.updated)', { stripeStatus: status, firebaseStatus, tier });
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
