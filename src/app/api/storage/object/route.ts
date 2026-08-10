import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp, getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;

function normalizeObjectPath(raw: string): string | null {
  let path = raw.trim();
  if (!path) return null;
  try {
    if (/^https?:\/\//i.test(path)) {
      const u = new URL(path);
      const match = u.pathname.match(/\/o\/(.+)$/);
      if (!match?.[1]) return null;
      path = decodeURIComponent(match[1]);
    } else if (path.startsWith('gs://')) {
      const without = path.replace(/^gs:\/\/[^/]+\//, '');
      path = decodeURIComponent(without);
    }
  } catch {
    return null;
  }
  path = path.replace(/^\/+/, '');
  if (!path || path.includes('..') || path.includes('\\')) return null;
  return path;
}

function companyMayAccessPath(companyId: string, objectPath: string): boolean {
  const prefixes = [
    `vehicle-inspections/${companyId}/`,
    `vehicle-documents/${companyId}/`,
  ];
  return prefixes.some((p) => objectPath.startsWith(p));
}

function guessContentType(objectPath: string): string {
  const lower = objectPath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

function getBucket() {
  const bucketName =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    undefined;
  return bucketName
    ? getAdminApp().storage().bucket(bucketName)
    : getAdminApp().storage().bucket();
}

/**
 * Authenticated Storage access for PDF embedding and pack downloads.
 * - Default: stream/download bytes via Admin (best for small images)
 * - ?sign=1: return a short-lived signed URL (best for large PDFs in packs)
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 'storage-object', WINDOW_MS, MAX_REQUESTS)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const authHeader = request.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawPath = request.nextUrl.searchParams.get('path');
    const objectPath = rawPath ? normalizeObjectPath(rawPath) : null;
    if (!objectPath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const profileSnap = await getAdminDb().collection('profiles').doc(decoded.uid).get();
    const companyId = profileSnap.data()?.company_id as string | undefined;
    const role = profileSnap.data()?.role as string | undefined;

    if (!companyId && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (role !== 'admin' && companyId && !companyMayAccessPath(companyId, objectPath)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const file = getBucket().file(objectPath);
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const wantSign = request.nextUrl.searchParams.get('sign') === '1';
    if (wantSign) {
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000,
        // Help browsers download with a sensible type when possible
        responseDisposition: 'inline',
        responseType: guessContentType(objectPath),
      });
      return NextResponse.json({ url });
    }

    const [contents] = await file.download();
    return new NextResponse(new Uint8Array(contents), {
      status: 200,
      headers: {
        'Content-Type': guessContentType(objectPath),
        'Cache-Control': 'private, max-age=60',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[api/storage/object]', err);
    return NextResponse.json({ error: 'Failed to load object' }, { status: 500 });
  }
}
