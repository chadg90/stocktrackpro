import type { NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function assertAdmin(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    throw new Error('Unauthorized');
  }

  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(idToken);
  const db = getAdminDb();
  const profileSnap = await db.collection('profiles').doc(decoded.uid).get();
  if (!profileSnap.exists || profileSnap.data()?.role !== 'admin') {
    throw new Error('Forbidden');
  }

  return decoded.uid;
}
