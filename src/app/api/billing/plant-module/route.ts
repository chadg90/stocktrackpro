/**
 * GET  /api/billing/plant-module  — return current plant module status for the company
 * POST /api/billing/plant-module  — Phase 2 stub: initiate Stripe checkout for plant add-on
 *
 * Phase 1 (DEV_MODE): GET returns { status: 'dev_mode', has_plant_module: true }
 * Phase 2 (production): will create a Stripe Checkout Session for the add-on price
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { PLANT_MODULE_DEV_MODE } from '@/lib/plantModeDev';

export async function GET(request: NextRequest) {
  try {
    const idToken = request.headers.get('authorization')?.slice(7) ?? '';
    if (!idToken) return NextResponse.json({ error: 'Authorization required' }, { status: 401 });

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const db = getAdminDb();
    const profileSnap = await db.collection('profiles').doc(uid).get();
    if (!profileSnap.exists) return NextResponse.json({ error: 'Profile not found' }, { status: 403 });

    const { company_id: companyId } = profileSnap.data()!;

    if (PLANT_MODULE_DEV_MODE) {
      return NextResponse.json({
        status: 'dev_mode',
        has_plant_module: true,
        plant_module_status: 'active',
      });
    }

    const orgSnap = await db.collection('organisations').doc(companyId).get();
    const orgData = orgSnap.data() ?? {};

    return NextResponse.json({
      has_plant_module: orgData.has_plant_module ?? false,
      plant_module_status: orgData.plant_module_status ?? 'inactive',
      plant_module_activated_at: orgData.plant_module_activated_at ?? null,
    });
  } catch (err) {
    console.error('[GET /api/billing/plant-module]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Phase 2 placeholder — Stripe add-on checkout will be implemented here
  return NextResponse.json(
    { error: 'Plant module billing is not yet available. Contact support to enable the add-on.' },
    { status: 501 }
  );
}
