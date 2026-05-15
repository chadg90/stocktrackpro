/**
 * PATCH  /api/plant-parts/[id]  — update a part
 * DELETE /api/plant-parts/[id]  — delete a part (managers/admins)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { PLANT_MODULE_DEV_MODE } from '@/lib/plantModeDev';
import { FieldValue } from 'firebase-admin/firestore';

async function verifyManagerAccess(request: NextRequest) {
  const idToken = request.headers.get('authorization')?.slice(7) ?? '';
  if (!idToken) return { error: 'Authorization required', status: 401 };

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return { error: 'Invalid or expired session', status: 401 };
  }

  const db = getAdminDb();
  const profileSnap = await db.collection('profiles').doc(uid).get();
  if (!profileSnap.exists) return { error: 'Profile not found', status: 403 };

  const profile = profileSnap.data()!;
  const { company_id: companyId, role } = profile;

  if (role !== 'admin' && role !== 'manager') {
    return { error: 'Only managers and admins can manage parts', status: 403 };
  }

  if (!PLANT_MODULE_DEV_MODE) {
    const orgSnap = await db.collection('organisations').doc(companyId).get();
    if (!orgSnap.exists || !orgSnap.data()?.has_plant_module) {
      return { error: 'Plant module not active', status: 403 };
    }
  }

  return { uid, companyId, role, db };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyManagerAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, db } = auth;

    const snap = await db.collection('plant_parts').doc(id).get();
    if (!snap.exists || snap.data()!.company_id !== companyId) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    }

    const body = await request.json();
    delete body.company_id;
    delete body.created_by;
    delete body.created_at;

    await db.collection('plant_parts').doc(id).update({ ...body });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/plant-parts/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyManagerAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, db } = auth;

    const snap = await db.collection('plant_parts').doc(id).get();
    if (!snap.exists || snap.data()!.company_id !== companyId) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    }

    await db.collection('plant_parts').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/plant-parts/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Suppress unused import warning for FieldValue
void FieldValue;
