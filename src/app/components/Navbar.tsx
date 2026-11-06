'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, LogIn, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FREE_TRIAL_CTA, LOGO_BLACK } from '@/lib/brand';

const featureMenuItems = [
  { name: 'All features', href: '/features/' },
  { name: 'Walkaround check app', href: '/vehicle-walkaround-check-app/' },
  { name: 'Defect reporting', href: '/vehicle-defect-reporting-software/' },
  { name: 'MOT & tax reminders', href: '/fleet-mot-tax-reminders/' },
];

const baseNavItems = [
  { name: 'Home', href: '/' },
  { name: 'Compliance', href: '/compliance-centre/' },
  { name: 'Pricing', href: '/pricing/' },
  { name: 'FAQ', href: '/faq/' },
  { name: 'Contact', href: '/contact/' },
];

function FeaturesMenu({ onLinkClick }: { onLinkClick: () => void }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="relative inline-flex items-center gap-1 px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[var(--mkt-ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        Features
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 min-w-[14rem] rounded-xl border border-[var(--mkt-border)] bg-white p-1.5 shadow-[0_12px_30px_rgba(10,22,40,0.12)]"
        >
          {featureMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[var(--mkt-ink)]"
              onClick={() => {
                setOpen(false);
                onLinkClick();
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Plain marketing nav — no Firebase Auth (Log in is always a link to /dashboard). */
function NavbarNavContent({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="ml-4 lg:ml-8 flex items-center gap-0 lg:gap-0.5">
      <Link
        href="/"
        className="relative px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[var(--mkt-ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white"
        onClick={onLinkClick}
      >
        Home
      </Link>
      <FeaturesMenu onLinkClick={onLinkClick} />
      {baseNavItems
        .filter((item) => item.name !== 'Home')
        .map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="relative px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[var(--mkt-ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white"
            onClick={onLinkClick}
          >
            {item.name}
          </Link>
        ))}
      <div className="ml-2 lg:ml-3 pl-2 lg:pl-3 border-l border-[var(--mkt-border)] flex items-center gap-2">
        <Link
          href="/dashboard/"
          className="inline-flex items-center gap-2 px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[var(--mkt-ink)] hover:bg-slate-50 transition-colors"
          onClick={onLinkClick}
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Log in
        </Link>
        <Link
          href="/onboarding/?start=1"
          className="inline-flex items-center justify-center px-3 lg:px-4 py-2.5 min-h-[44px] rounded-xl text-white font-semibold text-sm transition-colors duration-200 btn-brand-blue whitespace-nowrap"
          onClick={onLinkClick}
        >
          {FREE_TRIAL_CTA}
        </Link>
      </div>
    </div>
  );
}

function NavbarMobileNavContent({ onLinkClick }: { onLinkClick: () => void }) {
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <div className="px-4 pt-3 pb-6 space-y-1 bg-white border-t border-[var(--mkt-border)]">
      <Link
        href="/"
        className="block px-4 py-3 rounded-xl text-base font-medium text-slate-800 hover:bg-slate-50 transition-colors"
        onClick={onLinkClick}
      >
        Home
      </Link>
      <div>
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-slate-800 hover:bg-slate-50 transition-colors"
          aria-expanded={featuresOpen}
          onClick={() => setFeaturesOpen((value) => !value)}
        >
          Features
          <ChevronDown className={`h-5 w-5 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {featuresOpen && (
          <div className="ml-2 mb-1 space-y-1 border-l border-[var(--mkt-border)] pl-2">
            {featureMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={onLinkClick}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      {baseNavItems
        .filter((item) => item.name !== 'Home')
        .map((item) => (
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
          href="/onboarding/?start=1"
          className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl text-white font-semibold btn-brand-blue"
          onClick={onLinkClick}
        >
          Start 14-Day Free Trial
        </Link>
        <Link
          href="/dashboard/"
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
              <Image
                src={LOGO_BLACK}
                alt="Fleet Track PRO"
                width={240}
                height={56}
                className="h-10 w-auto sm:h-12 lg:h-14"
                sizes="(max-width: 640px) 152px, (max-width: 1024px) 200px, 240px"
                priority
              />
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
