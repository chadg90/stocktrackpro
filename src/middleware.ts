import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_STORE_URL } from '@/lib/brand';

const CANONICAL_HOST = 'www.fleettrackpro.co.uk';

/** Former brand hosts that permanently redirect to the live Fleet Track PRO site. */
const LEGACY_HOSTS = new Set(['stocktrackpro.co.uk', 'www.stocktrackpro.co.uk']);

/**
 * Friendly path aliases → one-hop 308 (before trailingSlash normalisation).
 * Keys are matched with and without a trailing slash.
 */
const FRIENDLY_REDIRECTS: Record<string, string> = {
  '/login': '/dashboard/',
  '/log-in': '/dashboard/',
  '/signin': '/dashboard/',
  '/sign-in': '/dashboard/',
  '/signup': '/onboarding/?start=1',
  '/sign-up': '/onboarding/?start=1',
  '/register': '/onboarding/?start=1',
  '/trial': '/onboarding/?start=1',
  '/free-trial': '/onboarding/?start=1',
  '/help': '/getting-started/',
  '/support': '/getting-started/',
  '/how-it-works': '/getting-started/',
  '/app': APP_STORE_URL,
  '/download': APP_STORE_URL,
  '/ios': APP_STORE_URL,
  '/compliance-centre/loler-thorough-examination-records': '/compliance-centre/',
  '/compliance-centre/plant-examination-due-date-tracking': '/compliance-centre/',
};

function friendlyRedirectDestination(pathname: string): string | null {
  const key = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return FRIENDLY_REDIRECTS[key] ?? null;
}

function ensureTrailingSlash(pathname: string): string {
  if (pathname === '/' || pathname.endsWith('/')) return pathname;
  return `${pathname}/`;
}

/** Build an absolute Location string — never use NextURL (it strips trailing slashes). */
function absoluteLocation(request: NextRequest, destination: string): string {
  const incoming = new URL(request.url);

  if (/^https?:\/\//i.test(destination)) {
    const target = new URL(destination);
    incoming.searchParams.forEach((value, key) => {
      if (!target.searchParams.has(key)) target.searchParams.set(key, value);
    });
    return target.toString();
  }

  // Keep the path string exactly (including a trailing slash). Avoid `new URL(path)`
  // pathname normalisation, which can drop the final slash in some runtimes.
  const qIndex = destination.indexOf('?');
  const pathPart = qIndex >= 0 ? destination.slice(0, qIndex) : destination;
  const merged = new URLSearchParams(qIndex >= 0 ? destination.slice(qIndex) : '');
  incoming.searchParams.forEach((value, key) => {
    if (!merged.has(key)) merged.set(key, value);
  });
  const search = merged.toString() ? `?${merged.toString()}` : '';
  return `${incoming.protocol}//${incoming.host}${pathPart}${search}`;
}

function sameRequestUrl(request: NextRequest, location: string): boolean {
  try {
    const a = new URL(request.url);
    const b = new URL(location, request.url);
    return a.pathname === b.pathname && a.search === b.search && a.host === b.host;
  } catch {
    return false;
  }
}

function redirectTo(request: NextRequest, destination: string, status: 301 | 308) {
  const location = absoluteLocation(request, destination);
  if (sameRequestUrl(request, location)) {
    // Never 308/301 to the identical URL (infinite loop).
    return NextResponse.next({
      request: { headers: withPathnameHeader(request) },
    });
  }
  // Plain Response with a string Location — bypasses NextURL slash stripping.
  return NextResponse.redirect(location, status);
}

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

function canonicalWwwLocation(pathname: string, search: string): string {
  // Prefer slash-canonical paths so apex → www is one hop to a final URL when possible.
  const path = pathname === '/' ? '/' : ensureTrailingSlash(pathname);
  return `https://${CANONICAL_HOST}${path}${search}`;
}

function withPathnameHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-ftp-pathname', new URL(request.url).pathname);
  return requestHeaders;
}

/** Marketing HTML CDN cache — product routes stay uncached. */
const MARKETING_CACHE_CONTROL =
  'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';
const NO_STORE_CACHE_CONTROL = 'no-store';

function cacheControlForPath(pathname: string): string {
  const base =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (
    base === '/dashboard' ||
    base.startsWith('/dashboard/') ||
    base === '/onboarding' ||
    base.startsWith('/onboarding/') ||
    base === '/api' ||
    base.startsWith('/api/')
  ) {
    return NO_STORE_CACHE_CONTROL;
  }
  return MARKETING_CACHE_CONTROL;
}

function applyCacheControl(response: NextResponse, pathname: string): NextResponse {
  response.headers.set('Cache-Control', cacheControlForPath(pathname));
  return response;
}

export function middleware(request: NextRequest) {
  const host = requestHost(request);
  const proto = requestProto(request);
  // Prefer the raw request path — NextURL can normalise trailing slashes.
  const pathname = new URL(request.url).pathname;
  const search = new URL(request.url).search;

  // Preview / Firebase default hosts: keep working, but never index.
  if (isPreviewHost(host)) {
    const response = NextResponse.next({
      request: { headers: withPathnameHeader(request) },
    });
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return applyCacheControl(response, pathname);
  }

  const isApex = host === 'fleettrackpro.co.uk';
  const isLegacy = LEGACY_HOSTS.has(host);
  const isOurMarketingHost = host === CANONICAL_HOST || isApex || isLegacy;
  const needsHttpsUpgrade = proto === 'http' && isOurMarketingHost;

  // One hop to https://www… (apex, legacy brand hosts, or plain HTTP).
  if (isApex || isLegacy || needsHttpsUpgrade) {
    const location = canonicalWwwLocation(pathname, search);
    if (sameRequestUrl(request, location)) {
      return applyCacheControl(
        NextResponse.next({
          request: { headers: withPathnameHeader(request) },
        }),
        pathname
      );
    }
    return NextResponse.redirect(location, 301);
  }

  const friendlyDest = friendlyRedirectDestination(pathname);
  if (friendlyDest) {
    return redirectTo(request, friendlyDest, 308);
  }

  // trailingSlash: true + skipTrailingSlashRedirect — enforce slash here (except root).
  if (pathname.length > 1 && !pathname.endsWith('/')) {
    return redirectTo(request, `${ensureTrailingSlash(pathname)}${search}`, 308);
  }

  return applyCacheControl(
    NextResponse.next({
      request: { headers: withPathnameHeader(request) },
    }),
    pathname
  );
}

export const config = {
  matcher: [
    /*
     * Product routes only. On App Hosting, any middleware hit forces
     * Cache-Control: private and drops s-maxage — so marketing HTML must never
     * match here (except the two retired LOLER article paths below, which must
     * 308 to /compliance-centre/ in one hop before Next's trailingSlash redirect).
     * Apex→www for marketing is handled by the Firebase custom domain.
     */
    '/dashboard',
    '/dashboard/:path*',
    '/onboarding',
    '/onboarding/:path*',
    '/api',
    '/api/:path*',
    '/compliance-centre/loler-thorough-examination-records',
    '/compliance-centre/loler-thorough-examination-records/',
    '/compliance-centre/plant-examination-due-date-tracking',
    '/compliance-centre/plant-examination-due-date-tracking/',
  ],
};
