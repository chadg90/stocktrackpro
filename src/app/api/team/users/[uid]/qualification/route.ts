/**
 * GET    /api/team/users/[uid]/qualification  — list qualifications for a user
 * POST   /api/team/users/[uid]/qualification  — add a qualification (managers/admins)
 * DELETE /api/team/users/[uid]/qualification?id=qualId  — remove a qualification
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

async function verifyManagerAndSameCompany(request: NextRequest, targetUid: string) {
  const idToken = request.headers.get('authorization')?.slice(7) ?? '';
  if (!idToken) return { error: 'Authorization required', status: 401 };

  let callerUid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    callerUid = decoded.uid;
  } catch {
    return { error: 'Invalid or expired session', status: 401 };
  }

  const db = getAdminDb();
  const callerSnap = await db.collection('profiles').doc(callerUid).get();
  if (!callerSnap.exists) return { error: 'Profile not found', status: 403 };

  const caller = callerSnap.data()!;
  if (caller.role !== 'admin' && caller.role !== 'manager') {
    return { error: 'Only managers and admins can manage qualifications', status: 403 };
  }

  const targetSnap = await db.collection('profiles').doc(targetUid).get();
  if (!targetSnap.exists || targetSnap.data()!.company_id !== caller.company_id) {
    return { error: 'User not found', status: 404 };
  }

  return { callerUid, companyId: caller.company_id as string, db };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid: targetUid } = await params;
    const auth = await verifyManagerAndSameCompany(request, targetUid);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, db } = auth;

    const snap = await db
      .collection('plant_qualifications')
      .where('company_id', '==', companyId)
      .where('user_uid', '==', targetUid)
      .get();

    const qualifications = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ qualifications });
  } catch (err) {
    console.error('[GET /api/team/users/[uid]/qualification]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid: targetUid } = await params;
    const auth = await verifyManagerAndSameCompany(request, targetUid);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { callerUid, companyId, db } = auth;

    const body = await request.json();
    if (!body.qualification_name?.trim()) {
      return NextResponse.json({ error: 'qualification_name is required' }, { status: 400 });
    }

    const qualData = {
      company_id: companyId,
      user_uid: targetUid,
      qualification_name: body.qualification_name.trim(),
      certificate_number: body.certificate_number?.trim() ?? null,
      issued_at: body.issued_at ?? null,
      expires_at: body.expires_at ?? null,
      document_url: body.document_url ?? null,
      created_at: FieldValue.serverTimestamp(),
      created_by: callerUid,
    };

    const ref = await db.collection('plant_qualifications').add(qualData);
    return NextResponse.json({ id: ref.id, ...qualData }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/team/users/[uid]/qualification]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid: targetUid } = await params;
    const auth = await verifyManagerAndSameCompany(request, targetUid);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, db } = auth;

    const { searchParams } = new URL(request.url);
    const qualId = searchParams.get('id');
    if (!qualId) return NextResponse.json({ error: 'Qualification id required as ?id=...' }, { status: 400 });

    const snap = await db.collection('plant_qualifications').doc(qualId).get();
    if (!snap.exists || snap.data()!.company_id !== companyId || snap.data()!.user_uid !== targetUid) {
      return NextResponse.json({ error: 'Qualification not found' }, { status: 404 });
    }

    await db.collection('plant_qualifications').doc(qualId).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/team/users/[uid]/qualification]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
