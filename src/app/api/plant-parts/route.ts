/**
 * GET  /api/plant-parts  — list parts library for the company
 * POST /api/plant-parts  — add a single part (managers/admins)
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

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyManagerAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, db } = auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.toLowerCase();

    const snap = await db
      .collection('plant_parts')
      .where('company_id', '==', companyId)
      .orderBy('name', 'asc')
      .get();

    let parts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (search) {
      parts = parts.filter((p: Record<string, unknown>) =>
        (p.name as string)?.toLowerCase().includes(search) ||
        (p.category as string)?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ parts });
  } catch (err) {
    console.error('[GET /api/plant-parts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyManagerAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { uid, companyId, role, db } = auth;

    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.json({ error: 'Only managers and admins can add parts' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'Part name is required' }, { status: 400 });

    const partData = {
      company_id: companyId,
      name: body.name.trim(),
      category: body.category?.trim() ?? null,
      applicable_categories: body.applicable_categories ?? [],
      description: body.description?.trim() ?? null,
      created_at: FieldValue.serverTimestamp(),
      created_by: uid,
    };

    const ref = await db.collection('plant_parts').add(partData);
    return NextResponse.json({ id: ref.id, ...partData }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/plant-parts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
