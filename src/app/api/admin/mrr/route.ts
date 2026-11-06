import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getStripe, PRICE_PER_VEHICLE, PRICE_PER_VEHICLE_YEARLY } from '@/lib/stripe-server';
import { isPaidStripeCompany, type AdminCompanyPlanFields } from '@/lib/adminCompanyMetrics';

export const runtime = 'nodejs';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

async function requireAdmin(request: NextRequest): Promise<{ uid: string } | NextResponse> {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 'admin-mrr', WINDOW_MS, MAX_REQUESTS)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const authHeader = request.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
  const profile = await getAdminDb().collection('profiles').doc(uid).get();
  if (!profile.exists || profile.data()?.role !== 'admin') {
    return NextResponse.json({ error: 'Platform admin only' }, { status: 403 });
  }
  return { uid };
}

function listPriceMonthlyGbp(company: AdminCompanyPlanFields): number {
  const custom = Number(company.monthly_amount_gbp);
  if (Number.isFinite(custom) && custom > 0) return custom;
  const slots = Number(company.subscribed_vehicles);
  if (!Number.isFinite(slots) || slots < 1) return 0;
  if ((company.billing_cycle || '').toLowerCase() === 'yearly') {
    return (slots * PRICE_PER_VEHICLE_YEARLY) / 12;
  }
  return slots * PRICE_PER_VEHICLE;
}

/** Monthly GBP from Stripe line items (annual ÷ 12; custom/loyalty unit amounts as charged). */
function monthlyGbpFromSubscription(subscription: Stripe.Subscription): number {
  let monthly = 0;
  for (const item of subscription.items?.data || []) {
    const price = item.price;
    if (!price) continue;
    const unit = (price.unit_amount ?? 0) / 100;
    const quantity = item.quantity ?? 1;
    const interval = price.recurring?.interval;
    const intervalCount = Math.max(1, price.recurring?.interval_count ?? 1);
    const periodTotal = unit * quantity;
    if (interval === 'year') monthly += periodTotal / (12 * intervalCount);
    else if (interval === 'month') monthly += periodTotal / intervalCount;
    else if (interval === 'week') monthly += (periodTotal * (52 / 12)) / intervalCount;
    else if (interval === 'day') monthly += (periodTotal * (365 / 12)) / intervalCount;
  }
  return monthly;
}

/** Sum of each paying company's actual monthly amount. */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const db = getAdminDb();
  const companiesSnap = await db.collection('companies').get();
  const paying = companiesSnap.docs.filter((d) =>
    isPaidStripeCompany(d.data() as AdminCompanyPlanFields)
  );

  let mrrGbp = 0;
  let stripe: ReturnType<typeof getStripe> | null = null;
  try {
    stripe = getStripe();
  } catch {
    stripe = null;
  }

  for (const docSnap of paying) {
    const data = docSnap.data() as AdminCompanyPlanFields;
    const subId = typeof data.stripe_subscription_id === 'string' ? data.stripe_subscription_id : '';
    if (stripe && subId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subId);
        if (sub.status === 'active') {
          mrrGbp += monthlyGbpFromSubscription(sub);
          continue;
        }
        continue;
      } catch {
        mrrGbp += listPriceMonthlyGbp(data);
        continue;
      }
    }
    mrrGbp += listPriceMonthlyGbp(data);
  }

  return NextResponse.json({ mrrGbp: Math.round(mrrGbp * 100) / 100 });
}
