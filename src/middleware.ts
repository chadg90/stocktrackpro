import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANONICAL_HOST = 'www.fleettrackpro.co.uk';

/** Former brand hosts that must permanently redirect to the live Fleet Track PRO site. */
const LEGACY_HOSTS = new Set([
  'stocktrackpro.co.uk',
  'www.stocktrackpro.co.uk',
  'fleettrackpro.co.uk',
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase() ?? '';

  if (LEGACY_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip Next internals and common static assets; redirect everything else
     * so old-brand paths keep their path while moving to fleettrackpro.co.uk.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
