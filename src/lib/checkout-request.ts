import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { SITE_URL } from '@/lib/site';

const ALLOWED_MANAGER_ROLES = ['manager', 'admin'];

export function getCheckoutBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (url?.trim()) {
    const trimmed = url.trim();
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  }
  return 'https://stocktrackpro.co.uk';
}

export function isAllowedCheckoutOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || SITE_URL;
  const allowedHost = baseUrl.replace(/^https?:\/\//, '').split('/')[0];
  const allowedOrigins = [
    `https://${allowedHost}`,
    `http://${allowedHost}`,
    'https://www.stocktrackpro.co.uk',
    'https://stocktrackpro.co.uk',
    'https://www.stocktrackpro.com',
    'https://stocktrackpro.com',
  ];
  if (origin && allowedOrigins.some((o) => origin === o || origin.startsWith(o + '/'))) return true;
  if (referer && allowedOrigins.some((o) => referer.startsWith(o))) return true;
  return !origin && !referer;
}

export type VerifiedManagerCheckout = {
  uid: string;
  companyId: string;
  stripeCustomerId: string | null;
};

/**
 * Verifies Firebase ID token and that the user is manager/admin for the given company.
 */
export async function verifyManagerCheckout(
  request: NextRequest,
  companyId: string
): Promise<VerifiedManagerCheckout | NextResponse> {
  const authHeader = request.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json(
      { error: 'Authorization required. Please log in and try again.' },
      { status: 401 }
    );
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json(
      { error: 'Invalid or expired session. Please log in again.' },
      { status: 401 }
    );
  }

  const trimmedCompanyId = companyId.trim();
  if (!trimmedCompanyId) {
    return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
  }

  const profileSnap = await getAdminDb().collection('profiles').doc(uid).get();
  if (!profileSnap.exists) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
  }
  const profile = profileSnap.data();
  if (profile?.company_id?.trim() !== trimmedCompanyId) {
    return NextResponse.json(
      { error: 'You can only start checkout for your own company.' },
      { status: 403 }
    );
  }
  if (!profile?.role || !ALLOWED_MANAGER_ROLES.includes(profile.role)) {
    return NextResponse.json(
      { error: 'Only managers and admins can start checkout.' },
      { status: 403 }
    );
  }

  const companySnap = await getAdminDb().collection('companies').doc(trimmedCompanyId).get();
  const stripeCustomerId =
    companySnap.exists && typeof companySnap.data()?.stripe_customer_id === 'string'
      ? companySnap.data()!.stripe_customer_id
      : null;

  return { uid, companyId: trimmedCompanyId, stripeCustomerId };
}
