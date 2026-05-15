/**
 * GET  /api/machines  — list all machines for the authenticated user's company
 * POST /api/machines  — create a new machine (managers + admins)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { PLANT_MODULE_DEV_MODE } from '@/lib/plantModeDev';
import type { CreateMachinePayload } from '@/types/plant';
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
  if (!companyId) return { error: 'No company linked to account', status: 403 };

  // Check company has plant module (or dev mode bypass)
  if (!PLANT_MODULE_DEV_MODE) {
    const orgSnap = await db.collection('organisations').doc(companyId).get();
    if (!orgSnap.exists || !orgSnap.data()?.has_plant_module) {
      return { error: 'Plant & Machinery module not active for this company', status: 403 };
    }
  }

  // Check user plant access (managers/admins always have access)
  const isManagerOrAdmin = role === 'admin' || role === 'manager';
  if (!isManagerOrAdmin && !profile.can_access_plant_module) {
    return { error: 'Plant module access not granted to this user', status: 403 };
  }

  return { uid, companyId, role, db };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyPlantAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, db } = auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let query = db.collection('plant_machines').where('company_id', '==', companyId);
    if (status) query = query.where('status', '==', status) as typeof query;
    if (category) query = query.where('category', '==', category) as typeof query;

    const snap = await query.orderBy('created_at', 'desc').get();
    const machines = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ machines });
  } catch (err) {
    console.error('[GET /api/machines]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyPlantAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { uid, companyId, role, db } = auth;

    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.json({ error: 'Only managers and admins can add machines' }, { status: 403 });
    }

    const body: CreateMachinePayload = await request.json();

    if (!body.name?.trim()) return NextResponse.json({ error: 'Machine name is required' }, { status: 400 });
    if (!body.asset_number?.trim()) return NextResponse.json({ error: 'Asset number is required' }, { status: 400 });
    if (!body.category) return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    if (!body.regulation_type) return NextResponse.json({ error: 'Regulation type is required' }, { status: 400 });

    // Ensure asset_number is unique within company
    const existing = await db
      .collection('plant_machines')
      .where('company_id', '==', companyId)
      .where('asset_number', '==', body.asset_number.trim())
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json({ error: `Asset number "${body.asset_number}" already exists` }, { status: 409 });
    }

    const now = FieldValue.serverTimestamp();
    const machineData = {
      company_id: companyId,
      name: body.name.trim(),
      asset_number: body.asset_number.trim(),
      serial_number: body.serial_number?.trim() ?? null,
      make: body.make?.trim() ?? null,
      model: body.model?.trim() ?? null,
      year: body.year ?? null,
      category: body.category,
      regulation_type: body.regulation_type,
      status: 'active',
      site_id: body.site_id ?? null,
      assigned_to: body.assigned_to ?? null,
      is_hired: body.is_hired ?? false,
      hire_company: body.hire_company?.trim() ?? null,
      hire_start: body.hire_start ?? null,
      hire_end: body.hire_end ?? null,
      next_loler_due: body.next_loler_due ?? null,
      next_service_due: body.next_service_due ?? null,
      next_puwer_due: body.next_puwer_due ?? null,
      image_url: body.image_url ?? null,
      created_at: now,
      updated_at: now,
      created_by: uid,
    };

    const ref = await db.collection('plant_machines').add(machineData);
    return NextResponse.json({ id: ref.id, ...machineData }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/machines]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
