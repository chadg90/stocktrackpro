'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Menu, X, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const NavbarNavContent = dynamic(
  () => import('./NavbarAuth').then((m) => m.NavbarNavContent),
  { ssr: false, loading: () => <NavbarNavFallback onLinkClick={() => {}} /> }
);
const NavbarMobileNavContent = dynamic(
  () => import('./NavbarAuth').then((m) => m.NavbarMobileNavContent),
  { ssr: false, loading: () => <NavbarMobileNavFallback onLinkClick={() => {}} /> }
);

const baseNavItems = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Compliance', href: '/compliance-centre' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];
const ONBOARDING_URL = '/onboarding';

function NavbarNavFallback({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="ml-4 lg:ml-8 flex items-center gap-0 lg:gap-0.5">
      {baseNavItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="relative px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[var(--mkt-ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white"
          onClick={onLinkClick}
        >
          {item.name}
        </Link>
      ))}
      <div className="ml-2 lg:ml-3 pl-2 lg:pl-3 border-l border-[var(--mkt-border)] flex items-center gap-1.5 lg:gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[var(--mkt-ink)] hover:bg-slate-50 transition-colors"
          onClick={onLinkClick}
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Log in
        </Link>
        <Link
          href={ONBOARDING_URL}
          className="inline-flex items-center justify-center px-3 lg:px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors duration-200 btn-brand-blue whitespace-nowrap"
          onClick={onLinkClick}
        >
          Start free trial
        </Link>
      </div>
    </div>
  );
}

function NavbarMobileNavFallback({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="px-4 pt-3 pb-6 space-y-1 bg-white border-t border-[var(--mkt-border)]">
      {baseNavItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="block px-4 py-3 rounded-xl text-base font-medium text-slate-800 hover:bg-slate-50 transition-colors"
          onClick={onLinkClick}
        >
          {item.name}
        </Link>
      ))}
      <div className="pt-4 mt-2 border-t border-[var(--mkt-border)] space-y-2">
        <Link
          href={ONBOARDING_URL}
          className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl text-white font-semibold btn-brand-blue"
          onClick={onLinkClick}
        >
          Start 14-Day Free Trial
        </Link>
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--mkt-border)] text-slate-800 hover:bg-slate-50"
          onClick={onLinkClick}
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Log in
        </Link>
      </div>
    </div>
  );
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      className={`fixed w-full z-40 left-0 top-0 transition-all duration-300 pt-[env(safe-area-inset-top)] ${
        isScrolled
          ? 'bg-white border-b border-[var(--mkt-border)] shadow-[0_4px_20px_rgba(10,22,40,0.06)]'
          : 'bg-white border-b border-[var(--mkt-border)]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-[4.5rem]">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" aria-label="Fleet Track PRO home">
              <div className="relative h-10 w-[152px] sm:h-12 sm:w-[200px] lg:h-14 lg:w-[240px]">
                <Image
                  src="/logo-black.png"
                  alt="Fleet Track PRO"
                  fill
                  sizes="(max-width: 640px) 152px, (max-width: 1024px) 200px, 240px"
                  style={{ objectFit: 'contain', objectPosition: 'left center' }}
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="hidden lg:block">
            <NavbarNavContent onLinkClick={closeMenu} />
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[calc(100vh-5rem)] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <NavbarMobileNavContent onLinkClick={closeMenu} />
      </div>
    </nav>
  );
};

export default Navbar;
