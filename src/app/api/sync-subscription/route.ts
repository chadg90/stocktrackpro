import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe-server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

/**
 * Manual subscription sync endpoint
 * Fetches subscription from Stripe and updates Firebase
 * Useful for fixing sync issues or testing
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const db = getAdminDb();
    const profileSnap = await db.collection('profiles').doc(uid).get();
    if (!profileSnap.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }
    const profile = profileSnap.data();
    const companyId = profile?.company_id;
    const role = profile?.role;
    
    if (!companyId || !role || !['manager', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Only managers and admins can sync subscriptions' }, { status: 403 });
    }

    const companySnap = await db.collection('companies').doc(companyId).get();
    if (!companySnap.exists) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    const company = companySnap.data();
    let subscriptionId = company?.stripe_subscription_id;

    const stripe = getStripe();
    let subscription;

    // If we have subscription_id, use it
    if (subscriptionId && typeof subscriptionId === 'string') {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    } else {
      // Try to find subscription by customer email or company metadata
      const userRecord = await getAdminAuth().getUser(uid);
      const userEmail = userRecord.email;
      
      if (!userEmail) {
        return NextResponse.json({ 
          error: 'No Stripe subscription found and cannot lookup by email. Please subscribe first.',
          hasSubscription: false 
        }, { status: 400 });
      }

      // Search for customer by email
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 10,
      });

      if (customers.data.length === 0) {
        // Already active/trial via app or other channel — don't treat as error
        const currentStatus = company?.subscription_status;
        if (currentStatus === 'active' || currentStatus === 'trial') {
          return NextResponse.json({
            success: true,
            synced: false,
            message: 'Your subscription is already active. Billing is managed via the app or another channel. Manage Billing Portal is only available for subscriptions started on the website.',
            subscription_status: currentStatus,
          });
        }
        return NextResponse.json({ 
          error: 'No Stripe customer found. Subscribe on the website (Pricing page) or complete subscription in the app first.',
          hasSubscription: false 
        }, { status: 400 });
      }

      // Find subscription for this company
      let foundSubscription = null;
      for (const customer of customers.data) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 10,
        });
        
        for (const sub of subscriptions.data) {
          if (sub.metadata?.company_id === companyId) {
            foundSubscription = sub;
            subscriptionId = sub.id;
            break;
          }
        }
        if (foundSubscription) break;
      }

      if (!foundSubscription) {
        // Try to get the most recent subscription for this customer
        const mostRecentCustomer = customers.data[0];
        const subscriptions = await stripe.subscriptions.list({
          customer: mostRecentCustomer.id,
          limit: 1,
          status: 'all',
        });
        
        if (subscriptions.data.length > 0) {
          foundSubscription = subscriptions.data[0];
          subscriptionId = foundSubscription.id;
        }
      }

      if (!foundSubscription) {
        const currentStatus = company?.subscription_status;
        if (currentStatus === 'active' || currentStatus === 'trial') {
          return NextResponse.json({
            success: true,
            synced: false,
            message: 'Your subscription is already active. Billing is managed via the app or another channel.',
            subscription_status: currentStatus,
          });
        }
        return NextResponse.json({ 
          error: 'No Stripe subscription found for this company. Subscribe on the website (Pricing page) or complete subscription in the app first.',
          hasSubscription: false 
        }, { status: 400 });
      }

      subscription = foundSubscription;
    }
    const companyIdFromMeta = subscription.metadata?.company_id;
    const tier = subscription.metadata?.tier;

    if (companyIdFromMeta !== companyId) {
      return NextResponse.json({ 
        error: 'Subscription metadata mismatch',
        subscriptionCompanyId: companyIdFromMeta,
        yourCompanyId: companyId
      }, { status: 400 });
    }

    // Map Stripe status to Firebase status
    const status = subscription.status;
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

    // Update Firebase
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

    return NextResponse.json({
      success: true,
      synced: {
        subscription_status: firebaseStatus,
        subscription_tier: tier,
        stripe_status: status,
        trial_end_date: trialEndDate?.toISOString(),
        expiry_date: expiryDate,
      }
    });
  } catch (err) {
    console.error('Sync subscription error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
