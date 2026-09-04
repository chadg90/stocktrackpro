'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_LEGAL_NAME, SITE_NAME, SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/brand';

const Footer = () => {
  const pathname = usePathname();
  const isDashboardRoute = !!pathname && pathname.startsWith('/dashboard');

  if (isDashboardRoute) return null;

  return (
    <footer className="bg-[var(--mkt-ink)] mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto py-14 px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="lg:col-span-1">
            <h3 className="mkt-display text-white font-semibold text-xl tracking-tight">{SITE_NAME}</h3>
            <p className="text-slate-300 text-sm mt-3 max-w-xs leading-relaxed">
              UK fleet compliance software for DVSA walkaround checks, defect close-out, and MOT tracking.
            </p>
            <p className="text-slate-400 text-sm mt-5">
              <Link href={SUPPORT_MAILTO} className="text-slate-200 hover:text-white underline underline-offset-4">
                {SUPPORT_EMAIL}
              </Link>
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">Product</p>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/vehicle-walkaround-check-app" className="hover:text-white">
                  Walkaround check app
                </Link>
              </li>
              <li>
                <Link href="/vehicle-defect-reporting-software" className="hover:text-white">
                  Defect reporting
                </Link>
              </li>
              <li>
                <Link href="/fleet-mot-tax-reminders" className="hover:text-white">
                  MOT &amp; tax reminders
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">Resources</p>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/compliance-centre" className="hover:text-white">
                  Compliance Centre
                </Link>
              </li>
              <li>
                <Link href="/customers/newstreet" className="hover:text-white">
                  Customer stories
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">Account</p>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/onboarding" className="hover:text-white">
                  Start free trial
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  Dashboard login
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-10 mt-10 border-t border-white/10">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
          <p className="text-slate-500 text-xs max-w-md leading-relaxed">
            {SITE_LEGAL_NAME} · Operated in the United Kingdom · Support via email and WhatsApp
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
