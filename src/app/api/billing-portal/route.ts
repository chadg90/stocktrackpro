import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { createBillingPortalSession } from '@/lib/stripe-server';

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (url) return url.startsWith('http') ? url : `https://${url}`;
  return 'https://stocktrackpro.com';
}

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
      return NextResponse.json({ error: 'Only managers and admins can manage billing' }, { status: 403 });
    }

    const companySnap = await db.collection('companies').doc(companyId).get();
    if (!companySnap.exists) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    const company = companySnap.data();
    const customerId = company?.stripe_customer_id;
    if (!customerId || typeof customerId !== 'string') {
      return NextResponse.json(
        { error: 'No Stripe subscription linked. Subscribe first from the pricing page.' },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl();
    const returnUrl = `${baseUrl}/dashboard`;
    const url = await createBillingPortalSession(customerId, returnUrl);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Billing portal error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to open billing portal' },
      { status: 500 }
    );
  }
}
