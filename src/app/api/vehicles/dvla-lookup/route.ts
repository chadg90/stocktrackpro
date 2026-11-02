import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import {
  formatUkRegistration,
  formatVehicleMakeModel,
  registrationKey,
} from '@/lib/ukVehicleRegistration';

export const maxDuration = 30;

const DVLA_API_URL = 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles';
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;

function parseDvlaDate(value: unknown): string | null {
  if (!value || typeof value !== 'string') return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function userMessageForDvlaStatus(status: number, bodyText: string): string {
  if (status === 404) return 'DVLA has no record for this registration. Fill in the details yourself.';
  if (status === 400) return 'DVLA rejected this registration format. Check the plate and try again.';
  if (status === 401 || status === 403) {
    return 'DVLA API key was rejected. Contact support if this keeps happening.';
  }
  if (status === 429) return 'DVLA rate limit reached. Try again in a minute, or fill in the details yourself.';
  if (status >= 500) return 'DVLA is temporarily unavailable. Fill in the details yourself.';
  const snippet = bodyText.replace(/\s+/g, ' ').trim().slice(0, 120);
  return snippet
    ? `Couldn't check this reg (DVLA ${status}: ${snippet}). Fill in the details yourself.`
    : `Couldn't check this reg (DVLA ${status}). Fill in the details yourself.`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 'dvla-lookup', WINDOW_MS, MAX_REQUESTS)) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Too many lookups. Please wait a moment, or fill in the details yourself.',
        },
        { status: 429 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json(
        { ok: false, message: 'Sign in to look up a registration.' },
        { status: 401 }
      );
    }

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json(
        { ok: false, message: 'Session expired. Sign in again, or fill in the details yourself.' },
        { status: 401 }
      );
    }

    const profileSnap = await getAdminDb().collection('profiles').doc(uid).get();
    if (!profileSnap.exists) {
      return NextResponse.json(
        { ok: false, message: 'Profile not found. Fill in the details yourself.' },
        { status: 403 }
      );
    }
    const role = String(profileSnap.data()?.role || '');
    if (role !== 'manager' && role !== 'admin') {
      return NextResponse.json(
        { ok: false, message: 'Only managers can look up vehicle details.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    // Always uppercase + strip spaces for the DVLA Vehicle Enquiry API.
    const registrationNumber = registrationKey(
      typeof body?.registration === 'string' ? body.registration : ''
    );
    if (!registrationNumber) {
      return NextResponse.json(
        { ok: false, message: 'Enter a registration to look up.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DVLA_API_KEY?.trim();
    if (!apiKey) {
      console.error('[dvla-lookup] DVLA_API_KEY is not set in App Hosting / env');
      return NextResponse.json(
        {
          ok: false,
          message: 'DVLA lookup is not configured on this server. Fill in the details yourself.',
          statusCode: null,
        },
        { status: 503 }
      );
    }

    const response = await fetch(DVLA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ registrationNumber }),
    });

    const bodyText = await response.text().catch(() => '');
    if (!response.ok) {
      console.error(
        `[dvla-lookup] DVLA status=${response.status} reg=${registrationNumber} body=${bodyText.slice(0, 300)}`
      );
      return NextResponse.json(
        {
          ok: false,
          registration: formatUkRegistration(registrationNumber),
          statusCode: response.status,
          message: userMessageForDvlaStatus(response.status, bodyText),
        },
        { status: 200 }
      );
    }

    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(bodyText) as Record<string, unknown>;
    } catch {
      console.error(`[dvla-lookup] DVLA returned non-JSON for ${registrationNumber}`);
      return NextResponse.json(
        {
          ok: false,
          registration: formatUkRegistration(registrationNumber),
          statusCode: response.status,
          message: "Couldn't read the DVLA response. Fill in the details yourself.",
        },
        { status: 200 }
      );
    }

    const makeRaw = typeof data.make === 'string' ? data.make : null;
    const colourRaw = typeof data.colour === 'string' ? data.colour : null;
    const yearRaw = data.yearOfManufacture != null ? Number(data.yearOfManufacture) : null;

    return NextResponse.json({
      ok: true,
      registration: formatUkRegistration(registrationNumber),
      make: makeRaw ? formatVehicleMakeModel(makeRaw) : null,
      // Vehicle Enquiry Service does not return model.
      model: null,
      year: yearRaw != null && !Number.isNaN(yearRaw) ? yearRaw : null,
      colour: colourRaw ? formatVehicleMakeModel(colourRaw) : null,
      motExpiry: parseDvlaDate(data.motExpiryDate),
      taxExpiry: parseDvlaDate(data.taxDueDate),
      motStatus: typeof data.motStatus === 'string' ? data.motStatus : null,
      taxStatus: typeof data.taxStatus === 'string' ? data.taxStatus : null,
    });
  } catch (error) {
    console.error('[dvla-lookup] unexpected error:', error);
    return NextResponse.json(
      {
        ok: false,
        message: "Couldn't check this reg. Fill in the details yourself.",
      },
      { status: 200 }
    );
  }
}
