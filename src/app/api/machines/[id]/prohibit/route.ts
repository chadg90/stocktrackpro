/**
 * POST /api/machines/[id]/prohibit
 * Marks a machine as prohibited from use (managers/admins).
 * Logs reason, inspector uid, and timestamp.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { PLANT_MODULE_DEV_MODE } from '@/lib/plantModeDev';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
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

    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.json({ error: 'Only managers and admins can prohibit machines' }, { status: 403 });
    }

    if (!PLANT_MODULE_DEV_MODE) {
      const orgSnap = await db.collection('organisations').doc(companyId).get();
      if (!orgSnap.exists || !orgSnap.data()?.has_plant_module) {
        return NextResponse.json({ error: 'Plant module not active' }, { status: 403 });
      }
    }

    const snap = await db.collection('plant_machines').doc(id).get();
    if (!snap.exists || snap.data()!.company_id !== companyId) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }
    if (snap.data()!.status === 'prohibited') {
      return NextResponse.json({ error: 'Machine is already prohibited' }, { status: 409 });
    }

    const { reason } = await request.json();
    if (!reason?.trim()) {
      return NextResponse.json({ error: 'A prohibition reason is required' }, { status: 400 });
    }

    await db.collection('plant_machines').doc(id).update({
      status: 'prohibited',
      prohibited_at: FieldValue.serverTimestamp(),
      prohibited_by: uid,
      prohibition_reason: reason.trim(),
      prohibition_cleared_at: null,
      prohibition_cleared_by: null,
      updated_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/machines/[id]/prohibit]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
