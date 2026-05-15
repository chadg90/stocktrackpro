/**
 * GET    /api/machines/[id]  — fetch single machine
 * PATCH  /api/machines/[id]  — update machine details (managers/admins)
 * DELETE /api/machines/[id]  — retire a machine (admins only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { PLANT_MODULE_DEV_MODE } from '@/lib/plantModeDev';
import { FieldValue } from 'firebase-admin/firestore';

async function verifyPlantAccess(request: NextRequest) {
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
  if (!companyId) return { error: 'No company linked', status: 403 };

  if (!PLANT_MODULE_DEV_MODE) {
    const orgSnap = await db.collection('organisations').doc(companyId).get();
    if (!orgSnap.exists || !orgSnap.data()?.has_plant_module) {
      return { error: 'Plant module not active', status: 403 };
    }
  }

  const isManagerOrAdmin = role === 'admin' || role === 'manager';
  if (!isManagerOrAdmin && !profile.can_access_plant_module) {
    return { error: 'Plant module access not granted', status: 403 };
  }

  return { uid, companyId, role, db };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyPlantAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, db } = auth;

    const snap = await db.collection('plant_machines').doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: 'Machine not found' }, { status: 404 });

    const data = snap.data()!;
    if (data.company_id !== companyId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ id: snap.id, ...data });
  } catch (err) {
    console.error('[GET /api/machines/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyPlantAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, role, db } = auth;

    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.json({ error: 'Only managers and admins can edit machines' }, { status: 403 });
    }

    const snap = await db.collection('plant_machines').doc(id).get();
    if (!snap.exists || snap.data()!.company_id !== companyId) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    const body = await request.json();
    // Prevent changing company ownership
    delete body.company_id;
    delete body.created_by;
    delete body.created_at;

    await db.collection('plant_machines').doc(id).update({
      ...body,
      updated_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/machines/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await verifyPlantAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, role, db } = auth;

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete machines' }, { status: 403 });
    }

    const snap = await db.collection('plant_machines').doc(id).get();
    if (!snap.exists || snap.data()!.company_id !== companyId) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    // Soft delete — set status to retired rather than hard delete
    await db.collection('plant_machines').doc(id).update({
      status: 'retired',
      updated_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/machines/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
