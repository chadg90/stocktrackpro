/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig = {
  reactStrictMode: true,
  // output: 'export' removed so /api/checkout and /api/webhooks/stripe work (Stripe integration)
  trailingSlash: true,
  // Marketing: Next may add a trailing slash before redirects run, which turns
  // no-slash LOLER aliases into 2 hops. Those four paths are handled in middleware
  // (one-hop 308). Other marketing URLs keep Next's trailingSlash behaviour.
  skipTrailingSlashRedirect: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    /** permanent: true → 308; query string is preserved by Next.js. */
    const withAndWithoutSlash = (source, destination) => [
      { source, destination, permanent: true },
      {
        source: source.endsWith('/') ? source.slice(0, -1) : `${source}/`,
        destination,
        permanent: true,
      },
    ];

    const APP_STORE_URL = 'https://apps.apple.com/gb/app/fleet-track-pro/id6744621973';

    return [
      // One-hop 308s (with and without slash) — listed first so they win over
      // trailingSlash: true adding an extra hop to the slashed URL.
      {
        source: '/compliance-centre/loler-thorough-examination-records',
        destination: '/compliance-centre/',
        permanent: true,
      },
      {
        source: '/compliance-centre/loler-thorough-examination-records/',
        destination: '/compliance-centre/',
        permanent: true,
      },
      {
        source: '/compliance-centre/plant-examination-due-date-tracking',
        destination: '/compliance-centre/',
        permanent: true,
      },
      {
        source: '/compliance-centre/plant-examination-due-date-tracking/',
        destination: '/compliance-centre/',
        permanent: true,
      },
      {
        source: '/compliance-centre/o-licence-defect-records/',
        destination: '/compliance-centre/van-fleet-defect-records/',
        permanent: true,
      },
      {
        source: '/compliance-centre/o-licence-defect-records',
        destination: '/compliance-centre/van-fleet-defect-records/',
        permanent: true,
      },
      ...withAndWithoutSlash('/book-demo', '/contact/'),
      // Login aliases → manager dashboard
      ...withAndWithoutSlash('/login', '/dashboard/'),
      ...withAndWithoutSlash('/log-in', '/dashboard/'),
      ...withAndWithoutSlash('/signin', '/dashboard/'),
      ...withAndWithoutSlash('/sign-in', '/dashboard/'),
      // Signup / trial aliases → onboarding
      ...withAndWithoutSlash('/signup', '/onboarding/?start=1'),
      ...withAndWithoutSlash('/sign-up', '/onboarding/?start=1'),
      ...withAndWithoutSlash('/register', '/onboarding/?start=1'),
      ...withAndWithoutSlash('/trial', '/onboarding/?start=1'),
      ...withAndWithoutSlash('/free-trial', '/onboarding/?start=1'),
      // Help aliases → getting-started guide
      ...withAndWithoutSlash('/help', '/getting-started/'),
      ...withAndWithoutSlash('/support', '/getting-started/'),
      ...withAndWithoutSlash('/how-it-works', '/getting-started/'),
      // App download aliases → App Store
      ...withAndWithoutSlash('/app', APP_STORE_URL),
      ...withAndWithoutSlash('/download', APP_STORE_URL),
      ...withAndWithoutSlash('/ios', APP_STORE_URL),
      // Dashboard IA restructure (permanent)
      ...withAndWithoutSlash('/dashboard/history', '/dashboard/inspections/'),
      ...withAndWithoutSlash('/dashboard/fleet-report/week', '/dashboard/inspections/'),
      ...withAndWithoutSlash('/dashboard/fleet-report/mileage', '/dashboard/mileage/'),
      ...withAndWithoutSlash(
        '/dashboard/fleet-report/compliance',
        '/dashboard/fleet-report/who-checked/'
      ),
      ...withAndWithoutSlash('/dashboard/inspection-proof', '/dashboard/vehicle-documents/'),
      ...withAndWithoutSlash('/dashboard/vehicle-reports', '/dashboard/vehicle-documents/'),
      ...withAndWithoutSlash('/dashboard/mileage-monitor', '/dashboard/mileage/'),
      ...withAndWithoutSlash('/dashboard/companies', '/dashboard/admin/companies/'),
    ];
  },
  async headers() {
    const marketingCache = {
      key: 'Cache-Control',
      value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    };
    const immutableCache = {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    };
    const noStore = {
      key: 'Cache-Control',
      value: 'no-store',
    };

    // Cover index + nested paths (trailingSlash: true uses /dashboard/).
    const noStoreSources = [
      '/dashboard',
      '/dashboard/',
      '/dashboard/:path*',
      '/onboarding',
      '/onboarding/',
      '/onboarding/:path*',
      '/api',
      '/api/:path*',
    ];

    const sitemapCache = {
      key: 'Cache-Control',
      value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
    };

    return [
      {
        source: '/_next/static/:path*',
        headers: [...securityHeaders, immutableCache],
      },
      {
        // Capturing group required — Next path-to-regexp rejects `(?:...)`.
        source: '/:path*.(js|css|avif|webp|png|jpg|jpeg|gif|svg|ico|woff|woff2)',
        headers: [...securityHeaders, immutableCache],
      },
      {
        source: '/sitemap.xml',
        headers: [...securityHeaders, sitemapCache],
      },
      ...noStoreSources.map((source) => ({
        source,
        headers: [...securityHeaders, noStore],
      })),
      {
        // Marketing HTML (and remaining routes). Product paths above win on overlap.
        source: '/:path*',
        headers: [...securityHeaders, marketingCache],
      },
    ];
  },
};

export default nextConfig; 