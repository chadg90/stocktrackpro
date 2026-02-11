import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe-server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
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
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      console.error('Stripe webhook signature verification failed:', message);
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const db = getAdminDb();

    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string | null;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
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

        await db.collection('companies').doc(companyId).set(
          {
            subscription_status: 'active',
            subscription_type: 'stripe',
            ...(tier && { subscription_tier: tier }),
            ...(expiryDate && { subscription_expiry_date: expiryDate }),
            stripe_subscription_id: subscription.id,
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
        const active = status === 'active';
        const periodEnd = subscription.current_period_end;
        const expiryDate = periodEnd
          ? new Date(periodEnd * 1000).toISOString().split('T')[0]
          : null;

        await db.collection('companies').doc(companyId).set(
          {
            subscription_status: active ? 'active' : status,
            subscription_type: 'stripe',
            ...(tier && { subscription_tier: tier }),
            ...(expiryDate && { subscription_expiry_date: expiryDate }),
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('Updated company', companyId, 'subscription (customer.subscription.updated)', status);
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
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook failed' },
      { status: 500 }
    );
  }
}
