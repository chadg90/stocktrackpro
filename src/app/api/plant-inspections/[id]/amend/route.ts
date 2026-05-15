/**
 * POST /api/plant-inspections/[id]/amend
 * Admins only — amend a field on an existing inspection with full audit trail.
 * An amendment log entry is appended to the inspection's amendments array.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const AMENDABLE_FIELDS = [
  'outcome',
  'notes',
  'next_inspection_due',
  'inspector_qualification',
  'site_id',
  'site_name',
] as const;

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
    if (profile.role !== 'admin' && profile.role !== 'manager') {
      return NextResponse.json({ error: 'Only managers and admins can amend inspections' }, { status: 403 });
    }

    const snap = await db.collection('plant_inspections').doc(id).get();
    if (!snap.exists || snap.data()!.company_id !== profile.company_id) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    const { field, new_value, reason } = await request.json();

    if (!AMENDABLE_FIELDS.includes(field as (typeof AMENDABLE_FIELDS)[number])) {
      return NextResponse.json({
        error: `Field "${field}" cannot be amended. Allowed fields: ${AMENDABLE_FIELDS.join(', ')}`,
      }, { status: 400 });
    }
    if (!reason?.trim()) {
      return NextResponse.json({ error: 'A reason for the amendment is required' }, { status: 400 });
    }

    const currentData = snap.data()!;
    const amendmentEntry = {
      amended_at: new Date().toISOString(),
      amended_by: uid,
      field,
      old_value: currentData[field] ?? null,
      new_value,
      reason: reason.trim(),
    };

    await db.collection('plant_inspections').doc(id).update({
      [field]: new_value,
      amendments: FieldValue.arrayUnion(amendmentEntry),
    });

    return NextResponse.json({ success: true, amendment: amendmentEntry });
  } catch (err) {
    console.error('[POST /api/plant-inspections/[id]/amend]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
