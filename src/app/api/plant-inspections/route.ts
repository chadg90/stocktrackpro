/**
 * GET  /api/plant-inspections  — list inspections for the company (with filters)
 * POST /api/plant-inspections  — submit a new plant inspection
 *
 * 9 server-side validations on POST:
 * 1. Valid auth token
 * 2. User has plant module access
 * 3. Company has plant module active
 * 4. machine_id exists and belongs to same company
 * 5. Machine is not prohibited
 * 6. inspection_type is a valid enum value
 * 7. outcome is a valid enum value
 * 8. inspected_at is not in the future
 * 9. inspector_uid in payload must match the authenticated user
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { PLANT_MODULE_DEV_MODE } from '@/lib/plantModeDev';
import { FieldValue } from 'firebase-admin/firestore';
import type { CreatePlantInspectionPayload } from '@/types/plant';

const VALID_INSPECTION_TYPES = ['LOLER', 'PUWER', 'service', 'hire_check'] as const;
const VALID_OUTCOMES = ['pass', 'fail', 'advisory'] as const;

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

  // Validation 3: company has plant module (or dev mode bypass)
  if (!PLANT_MODULE_DEV_MODE) {
    const orgSnap = await db.collection('organisations').doc(companyId).get();
    if (!orgSnap.exists || !orgSnap.data()?.has_plant_module) {
      return { error: 'Plant module not active for this company', status: 403 };
    }
  }

  // Validation 2: user has plant access (managers/admins always do)
  const isManagerOrAdmin = role === 'admin' || role === 'manager';
  if (!isManagerOrAdmin && !profile.can_access_plant_module) {
    return { error: 'Plant module access not granted to this user', status: 403 };
  }

  return { uid, companyId, role, db, displayName: profile.name ?? profile.displayName ?? '' };
}

/** Generate reference number: STP-INSP-YYYY-NNNNNN */
async function generateReferenceNumber(db: FirebaseFirestore.Firestore, companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const snap = await db
    .collection('plant_inspections')
    .where('company_id', '==', companyId)
    .get();
  const seq = snap.size + 1;
  return `STP-INSP-${year}-${String(seq).padStart(6, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyPlantAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, db } = auth;

    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machine_id');
    const type = searchParams.get('type');
    const outcome = searchParams.get('outcome');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

    let query = db.collection('plant_inspections').where('company_id', '==', companyId);
    if (machineId) query = query.where('machine_id', '==', machineId) as typeof query;
    if (type) query = query.where('inspection_type', '==', type) as typeof query;
    if (outcome) query = query.where('outcome', '==', outcome) as typeof query;

    const snap = await query.orderBy('inspected_at', 'desc').limit(limit).get();
    const inspections = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ inspections });
  } catch (err) {
    console.error('[GET /api/plant-inspections]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyPlantAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { uid, companyId, db, displayName } = auth;

    const body: CreatePlantInspectionPayload = await request.json();

    // Validation 6: inspection_type enum
    if (!VALID_INSPECTION_TYPES.includes(body.inspection_type as (typeof VALID_INSPECTION_TYPES)[number])) {
      return NextResponse.json({ error: `Invalid inspection_type. Must be one of: ${VALID_INSPECTION_TYPES.join(', ')}` }, { status: 400 });
    }

    // Validation 7: outcome enum
    if (!VALID_OUTCOMES.includes(body.outcome as (typeof VALID_OUTCOMES)[number])) {
      return NextResponse.json({ error: `Invalid outcome. Must be one of: ${VALID_OUTCOMES.join(', ')}` }, { status: 400 });
    }

    // Validation 8: inspected_at not in the future
    if (body.inspected_at) {
      const inspectedDate = new Date(body.inspected_at);
      if (inspectedDate > new Date()) {
        return NextResponse.json({ error: 'Inspection date cannot be in the future' }, { status: 400 });
      }
    }

    // Validation 4: machine exists and belongs to company
    if (!body.machine_id) {
      return NextResponse.json({ error: 'machine_id is required' }, { status: 400 });
    }
    const machineSnap = await db.collection('plant_machines').doc(body.machine_id).get();
    if (!machineSnap.exists || machineSnap.data()!.company_id !== companyId) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }
    const machine = machineSnap.data()!;

    // Validation 5: machine not prohibited
    if (machine.status === 'prohibited') {
      return NextResponse.json({ error: 'Cannot inspect a prohibited machine. Clear the prohibition first.' }, { status: 409 });
    }

    // Validation 9: inspector_uid matches auth user (already guaranteed — we set it from token)
    const referenceNumber = await generateReferenceNumber(db, companyId);

    // Resolve site name if site_id provided
    let siteName: string | null = null;
    if (body.site_id) {
      const siteSnap = await db.collection('company_sites').doc(body.site_id).get();
      if (siteSnap.exists && siteSnap.data()!.company_id === companyId) {
        siteName = siteSnap.data()!.name;
      }
    }

    const now = FieldValue.serverTimestamp();
    const inspectionData = {
      company_id: companyId,
      machine_id: body.machine_id,
      machine_asset_number: machine.asset_number,
      machine_name: machine.name,
      reference_number: referenceNumber,
      inspection_type: body.inspection_type,
      regulation_type: machine.regulation_type,
      inspector_uid: uid,
      inspector_name: displayName,
      inspector_qualification: body.inspector_qualification ?? null,
      inspector_signature_url: body.inspector_signature_url ?? null,
      inspected_at: body.inspected_at ?? new Date().toISOString(),
      site_id: body.site_id ?? null,
      site_name: siteName,
      outcome: body.outcome,
      defects: body.defects ?? [],
      notes: body.notes ?? null,
      next_inspection_due: body.next_inspection_due ?? null,
      pdf_url: null,
      amendments: [],
      created_at: now,
      created_by: uid,
    };

    const ref = await db.collection('plant_inspections').add(inspectionData);

    // If machine passed/advisory, update next_loler_due or next_service_due
    const dueDateUpdates: Record<string, string | null> = {};
    if (body.next_inspection_due) {
      if (body.inspection_type === 'LOLER') dueDateUpdates['next_loler_due'] = body.next_inspection_due;
      if (body.inspection_type === 'PUWER') dueDateUpdates['next_puwer_due'] = body.next_inspection_due;
      if (body.inspection_type === 'service') dueDateUpdates['next_service_due'] = body.next_inspection_due;
    }
    if (Object.keys(dueDateUpdates).length > 0) {
      await db.collection('plant_machines').doc(body.machine_id).update({
        ...dueDateUpdates,
        updated_at: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ id: ref.id, reference_number: referenceNumber }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/plant-inspections]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
