/**
 * GET /api/plant-inspections/[id]  — fetch a single inspection
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { PLANT_MODULE_DEV_MODE } from '@/lib/plantModeDev';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const profile = profileSnap.data()!;
    const { company_id: companyId, role } = profile;

    if (!PLANT_MODULE_DEV_MODE) {
      const orgSnap = await db.collection('organisations').doc(companyId).get();
      if (!orgSnap.exists || !orgSnap.data()?.has_plant_module) {
        return NextResponse.json({ error: 'Plant module not active' }, { status: 403 });
      }
    }

    const isManagerOrAdmin = role === 'admin' || role === 'manager';
    if (!isManagerOrAdmin && !profile.can_access_plant_module) {
      return NextResponse.json({ error: 'Plant module access not granted' }, { status: 403 });
    }

    const snap = await db.collection('plant_inspections').doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });

    const data = snap.data()!;
    if (data.company_id !== companyId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ id: snap.id, ...data });
  } catch (err) {
    console.error('[GET /api/plant-inspections/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
