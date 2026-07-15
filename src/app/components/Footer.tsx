'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_LEGAL_NAME, SITE_NAME, SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/brand';

const Footer = () => {
  const pathname = usePathname();
  const isDashboardRoute = !!pathname && pathname.startsWith('/dashboard');

  return (
    <footer className={`bg-slate-900 mt-auto border-t border-slate-800 ${isDashboardRoute ? 'lg:pl-64' : ''}`}>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-blue-400 font-semibold text-lg">{SITE_NAME}</h3>
            <p className="text-slate-200 text-sm mt-1">
              Email:{' '}
              <Link href={SUPPORT_MAILTO} className="hover:text-blue-400">
                {SUPPORT_EMAIL}
              </Link>
            </p>
            <p className="text-slate-400 text-xs mt-3 max-w-md leading-relaxed">
              {SITE_LEGAL_NAME} · UK van fleet &amp; optional plant compliance software · Support via email and WhatsApp
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <Link href="/" className="hover:text-blue-400">
              Home
            </Link>
            <Link href="/features" className="hover:text-blue-400">
              Features
            </Link>
            <Link href="/about" className="hover:text-blue-400">
              About
            </Link>
            <Link href="/compliance-centre" className="hover:text-blue-400">
              Compliance Centre
            </Link>
            <Link href="/pricing" className="hover:text-blue-400">
              Pricing
            </Link>
            <Link href="/faq" className="hover:text-blue-400">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-blue-400">
              Contact
            </Link>
            <Link href="/dashboard" className="hover:text-blue-400">
              Dashboard Login
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-slate-800">
          <p className="text-slate-300 text-sm">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <Link href="/terms" className="hover:text-blue-400">
              Terms & Conditions
            </Link>
            <Link href="/subscription-terms" className="hover:text-blue-400">
              Subscription Terms
            </Link>
            <Link href="/privacy" className="hover:text-blue-400">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-blue-400">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
