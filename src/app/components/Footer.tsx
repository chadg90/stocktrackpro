'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_LEGAL_NAME, SITE_NAME, SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/brand';

const Footer = () => {
  const pathname = usePathname();
  const isDashboardRoute = !!pathname && pathname.startsWith('/dashboard');

  return (
    <footer className={`bg-black mt-auto border-t border-blue-500/20 ${isDashboardRoute ? 'lg:pl-64' : ''}`}>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-blue-500 font-semibold text-lg">{SITE_NAME}</h3>
            <p className="text-white text-sm mt-1">
              Email:{' '}
              <Link href={SUPPORT_MAILTO} className="hover:text-blue-500">
                {SUPPORT_EMAIL}
              </Link>
            </p>
            <p className="text-white/55 text-xs mt-3 max-w-md leading-relaxed">
              {SITE_LEGAL_NAME} · UK van fleet &amp; optional plant compliance software · Support via email and WhatsApp
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/90">
            <Link href="/" className="hover:text-blue-500">Home</Link>
            <Link href="/features" className="hover:text-blue-500">Features</Link>
            <Link href="/about" className="hover:text-blue-500">About</Link>
            <Link href="/compliance-centre" className="hover:text-blue-500">Compliance Centre</Link>
            <Link href="/pricing" className="hover:text-blue-500">Pricing</Link>
            <Link href="/faq" className="hover:text-blue-500">FAQ</Link>
            <Link href="/contact" className="hover:text-blue-500">Contact</Link>
            <Link href="/dashboard" className="hover:text-blue-500">
              Dashboard Login
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-blue-500/20">
          <p className="text-white text-sm">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-white/90">
            <Link href="/terms" className="hover:text-blue-500">Terms & Conditions</Link>
            <Link href="/subscription-terms" className="hover:text-blue-500">Subscription Terms</Link>
            <Link href="/privacy" className="hover:text-blue-500">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-blue-500">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
