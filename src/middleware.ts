import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANONICAL_HOST = 'www.fleettrackpro.co.uk';

/** Former brand hosts that permanently redirect to the live Fleet Track PRO site. */
const LEGACY_HOSTS = new Set(['stocktrackpro.co.uk', 'www.stocktrackpro.co.uk']);

function requestHost(request: NextRequest): string {
  const raw =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    '';
  return raw.split(',')[0]?.trim().split(':')[0]?.toLowerCase() ?? '';
}

function requestProto(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-proto');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim().toLowerCase() ?? '';
  }
  return request.nextUrl.protocol.replace(':', '').toLowerCase();
}

function isPreviewHost(host: string): boolean {
  return (
    host.endsWith('.hosted.app') ||
    host.endsWith('.web.app') ||
    host.endsWith('.firebaseapp.com')
  );
}

function canonicalLocation(pathname: string, search: string): string {
  return `https://${CANONICAL_HOST}${pathname}${search}`;
}

function withPathnameHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-ftp-pathname', request.nextUrl.pathname);
  return requestHeaders;
}

export function middleware(request: NextRequest) {
  const host = requestHost(request);
  const proto = requestProto(request);
  const { pathname, search } = request.nextUrl;

  // Preview / Firebase default hosts: keep working, but never index.
  if (isPreviewHost(host)) {
    const response = NextResponse.next({
      request: { headers: withPathnameHeader(request) },
    });
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  const isApex = host === 'fleettrackpro.co.uk';
  const isLegacy = LEGACY_HOSTS.has(host);
  const isOurMarketingHost =
    host === CANONICAL_HOST || isApex || isLegacy;
  const needsHttpsUpgrade = proto === 'http' && isOurMarketingHost;

  // One hop to https://www… (apex, legacy brand hosts, or plain HTTP).
  if (isApex || isLegacy || needsHttpsUpgrade) {
    return NextResponse.redirect(canonicalLocation(pathname, search), 301);
  }

  return NextResponse.next({
    request: { headers: withPathnameHeader(request) },
  });
}

export const config = {
  matcher: [
    /*
     * All paths except Next internals, favicon, robots, sitemap, and static
     * assets (files with an extension).
     */
    '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
};
