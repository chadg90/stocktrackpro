import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { normalizeReferralCode } from '@/lib/referralCode';

export const runtime = 'nodejs';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

type AttachBody = {
  companyId?: string;
  code?: string;
};

/**
 * Attach a referral code to a newly created company (Admin SDK only).
 * Never blocks signup — callers should swallow client errors.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 'referrals-attach', WINDOW_MS, MAX_REQUESTS)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const authHeader = request.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    let body: AttachBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const companyId = typeof body.companyId === 'string' ? body.companyId.trim() : '';
    const code = normalizeReferralCode(body.code);
    if (!companyId || companyId.length > 128) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
    }
    if (!code) {
      return NextResponse.json({ error: 'code is required' }, { status: 400 });
    }

    const db = getAdminDb();
    const companyRef = db.collection('companies').doc(companyId);
    const companySnap = await companyRef.get();
    if (!companySnap.exists) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const company = companySnap.data() || {};
    if (company.created_by !== uid) {
      return NextResponse.json({ error: 'Only the company owner can attach a referral' }, { status: 403 });
    }

    if (company.referral && typeof company.referral === 'object') {
      return NextResponse.json({
        ok: true,
        alreadyAttached: true,
        status: (company.referral as { status?: string }).status || 'pending',
      });
    }

    const codeSnap = await db.collection('referralCodes').doc(code).get();
    const codeData = codeSnap.exists ? codeSnap.data() : null;
    const recognised = Boolean(codeData && codeData.active === true);
    const status = recognised ? 'pending' : 'unrecognised';
    const referrerId =
      recognised && typeof codeData?.referrerId === 'string' ? codeData.referrerId : null;

    const referralPayload = {
      code,
      status,
      capturedAt: FieldValue.serverTimestamp(),
      source: 'signup' as const,
    };

    const batch = db.batch();
    batch.update(companyRef, { referral: referralPayload });
    batch.set(
      db.collection('referrals').doc(companyId),
      {
        ...referralPayload,
        companyId,
        referrerId,
        companyName: typeof company.name === 'string' ? company.name : null,
        ownerUid: uid,
      },
      { merge: false }
    );
    await batch.commit();

    return NextResponse.json({
      ok: true,
      status,
      recognised,
    });
  } catch (err) {
    console.error('[referrals/attach]', err);
    return NextResponse.json({ error: 'Failed to attach referral' }, { status: 500 });
  }
}
