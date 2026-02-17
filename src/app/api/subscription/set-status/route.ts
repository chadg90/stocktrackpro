import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

/**
 * Set subscription status on the company (e.g. when user subscribes via the app).
 * Dashboard access is driven by company.subscription_status ('active' | 'trial').
 * This allows app-originated subscriptions to show as active on the dashboard
 * without requiring a Stripe customer.
 */
const VALID_STATUSES = ['active', 'trial', 'inactive'];
const VALID_TIERS = ['PRO_STARTER', 'PRO_TEAM', 'PRO_BUSINESS', 'PRO_ENTERPRISE'];

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
      return NextResponse.json(
        { error: 'Only managers and admins can update subscription status' },
        { status: 403 }
      );
    }

    const companySnap = await db.collection('companies').doc(companyId).get();
    if (!companySnap.exists) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    let body: { subscription_status?: string; subscription_tier?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const status = body?.subscription_status;
    const tier = body?.subscription_tier;

    if (!status || typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `subscription_status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      subscription_status: status,
      subscription_type: 'app',
      updated_at: new Date().toISOString(),
    };

    if (tier && typeof tier === 'string' && VALID_TIERS.includes(tier)) {
      updates.subscription_tier = tier;
    }

    await db.collection('companies').doc(companyId).set(updates, { merge: true });

    const response: { success: true; subscription_status: string; subscription_tier?: string } = {
      success: true,
      subscription_status: status,
    };
    if (typeof updates.subscription_tier === 'string') {
      response.subscription_tier = updates.subscription_tier;
    }
    return NextResponse.json(response);
  } catch (err) {
    console.error('Set subscription status error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    );
  }
}
