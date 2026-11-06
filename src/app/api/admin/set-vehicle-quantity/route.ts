import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe-server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import {
  ADMIN_MAX_VEHICLES,
  ADMIN_MIN_VEHICLES,
  isValidAdminVehicleQuantity,
} from '@/lib/stripeVehicleQuantity';

export const runtime = 'nodejs';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

/**
 * Platform admin: set a company's subscribed vehicle quantity.
 *
 * Safety:
 * - Admin role required
 * - Updates Stripe subscription item quantity with proration_behavior: 'none'
 *   (matches subscription terms: change applies without mid-cycle charge)
 * - Keeps subscription metadata.vehicle_count in sync
 * - Writes Firestore subscribed_vehicles immediately
 * - Blocks decreases below current non-retired vehicle count
 * - Audit log entry
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 'admin-set-vehicle-quantity', WINDOW_MS, MAX_REQUESTS)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

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
    if (!profileSnap.exists || profileSnap.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Only platform admins can change vehicle quantity' }, { status: 403 });
    }

    let body: { company_id?: string; vehicle_count?: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const companyId = typeof body.company_id === 'string' ? body.company_id.trim() : '';
    const vehicleCount = body.vehicle_count;
    if (!companyId) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }
    if (!isValidAdminVehicleQuantity(vehicleCount)) {
      return NextResponse.json(
        {
          error: `vehicle_count must be a whole number between ${ADMIN_MIN_VEHICLES} and ${ADMIN_MAX_VEHICLES}`,
        },
        { status: 400 }
      );
    }

    const companyRef = db.collection('companies').doc(companyId);
    const companySnap = await companyRef.get();
    if (!companySnap.exists) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const company = companySnap.data() || {};
    if (company.legacy === true) {
      return NextResponse.json(
        {
          error:
            'Legacy companies are not billed per vehicle and have no slot limit. Leave legacy access as-is.',
        },
        { status: 400 }
      );
    }
    const subscriptionId =
      typeof company.stripe_subscription_id === 'string' ? company.stripe_subscription_id : null;
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Company has no Stripe subscription. Use checkout or set legacy access separately.' },
        { status: 400 }
      );
    }

    const previousQuantity = Number(company.subscribed_vehicles) || null;

    // Count non-retired vehicles — cannot drop slots below what they currently use.
    const vehiclesSnap = await db.collection('vehicles').where('company_id', '==', companyId).get();
    const billableCount = vehiclesSnap.docs.filter((docSnap) => {
      const status = String(docSnap.data()?.status || 'active').toLowerCase();
      return status !== 'retired';
    }).length;

    if (vehicleCount < billableCount) {
      return NextResponse.json(
        {
          error: `Cannot set quantity to ${vehicleCount}: company has ${billableCount} non-retired vehicle(s). Retire or remove excess vehicles first.`,
          billable_count: billableCount,
        },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const item = subscription.items?.data?.[0];
    if (!item?.id) {
      return NextResponse.json({ error: 'Stripe subscription has no billable item' }, { status: 400 });
    }

    const currentStripeQty = item.quantity ?? null;
    if (currentStripeQty === vehicleCount && previousQuantity === vehicleCount) {
      return NextResponse.json({
        success: true,
        unchanged: true,
        company_id: companyId,
        vehicle_count: vehicleCount,
        message: 'Quantity already set to this value.',
      });
    }

    // No mid-cycle invoice — quantity changes apply for the next billing period (per terms).
    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: item.id, quantity: vehicleCount }],
      proration_behavior: 'none',
      metadata: {
        ...subscription.metadata,
        company_id: companyId,
        vehicle_count: String(vehicleCount),
      },
    });

    const now = new Date().toISOString();
    await companyRef.set(
      {
        subscribed_vehicles: vehicleCount,
        subscription_type: 'stripe',
        stripe_subscription_id: subscriptionId,
        updated_at: now,
      },
      { merge: true }
    );

    await db.collection('admin_audit_logs').add({
      action: 'set_vehicle_quantity',
      admin_uid: uid,
      company_id: companyId,
      company_name: company.name || null,
      previous_quantity: previousQuantity,
      new_quantity: vehicleCount,
      stripe_subscription_id: subscriptionId,
      billable_vehicle_count: billableCount,
      proration_behavior: 'none',
      created_at: now,
    });

    return NextResponse.json({
      success: true,
      company_id: companyId,
      vehicle_count: vehicleCount,
      previous_quantity: previousQuantity,
      billable_count: billableCount,
      message:
        'Vehicle slots updated. Stripe will charge the new quantity from the next billing cycle (no immediate proration).',
    });
  } catch (err) {
    console.error('Admin set-vehicle-quantity error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    );
  }
}
