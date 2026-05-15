/**
 * GET  /api/company-sites  — list all sites for the company
 * POST /api/company-sites  — create a site (managers/admins)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

async function verifyAccess(request: NextRequest) {
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
  const { company_id: companyId } = profile;
  if (!companyId) return { error: 'No company linked', status: 403 };

  return { uid, companyId, role: profile.role as string, db };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { companyId, db } = auth;

    const snap = await db
      .collection('company_sites')
      .where('company_id', '==', companyId)
      .orderBy('name', 'asc')
      .get();

    const sites = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ sites });
  } catch (err) {
    console.error('[GET /api/company-sites]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAccess(request);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { uid, companyId, role, db } = auth;

    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.json({ error: 'Only managers and admins can add sites' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'Site name is required' }, { status: 400 });

    const siteData = {
      company_id: companyId,
      name: body.name.trim(),
      address: body.address?.trim() ?? null,
      postcode: body.postcode?.trim() ?? null,
      contact_name: body.contact_name?.trim() ?? null,
      contact_phone: body.contact_phone?.trim() ?? null,
      created_at: FieldValue.serverTimestamp(),
      created_by: uid,
    };

    const ref = await db.collection('company_sites').add(siteData);
    return NextResponse.json({ id: ref.id, ...siteData }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/company-sites]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
