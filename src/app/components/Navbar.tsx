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
  { name: 'Compliance Centre', href: '/compliance-centre' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];
const ONBOARDING_URL = '/onboarding';

function NavbarNavFallback({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="ml-10 flex items-center gap-1 sm:gap-2">
      {baseNavItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="relative px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-[var(--brand-blue)] after:scale-x-0 after:transition-transform hover:after:scale-x-100"
          onClick={onLinkClick}
        >
          {item.name}
        </Link>
      ))}
      <div className="ml-4 pl-4 border-l border-slate-200 flex items-center gap-2">
        <Link
          href={ONBOARDING_URL}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-white font-semibold text-sm hover:scale-[1.02] transition-all duration-200 btn-brand-blue"
          onClick={onLinkClick}
        >
          Start 7-Day Free Trial
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
          onClick={onLinkClick}
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Log in
        </Link>
      </div>
    </div>
  );
}

function NavbarMobileNavFallback({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="px-4 pt-4 pb-6 space-y-1 bg-white border-t border-slate-200">
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
      <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
        <Link
          href={ONBOARDING_URL}
          className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-white font-semibold btn-brand-blue"
          onClick={onLinkClick}
        >
          Start 7-Day Free Trial
        </Link>
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50"
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
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      className={`fixed w-full z-40 left-0 top-0 transition-all duration-300 pt-[env(safe-area-inset-top)] ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" aria-label="Fleet Track PRO home">
              <div className="relative h-12 w-[200px] sm:h-16 sm:w-[280px]">
                <Image
                  src="/logo-black.png"
                  alt="Fleet Track PRO"
                  fill
                  sizes="(max-width: 640px) 200px, 280px"
                  style={{ objectFit: 'contain', objectPosition: 'left center' }}
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="hidden md:block">
            <NavbarNavContent onLinkClick={closeMenu} />
          </div>

          <div className="md:hidden">
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
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[calc(100vh-5rem)] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <NavbarMobileNavContent onLinkClick={closeMenu} />
      </div>
    </nav>
  );
};

export default Navbar;
