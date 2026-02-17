'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Menu, X, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Lazy-load auth-dependent nav so Firebase is in a separate chunk (lighter initial load for marketing pages)
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
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

function NavbarNavFallback({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="ml-10 flex items-center space-x-4">
      {baseNavItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black ${
            item.name === 'Contact' ? 'text-white bg-primary hover:bg-primary-light' : 'text-white/90 hover:text-primary'
          }`}
          onClick={onLinkClick}
        >
          {item.name}
        </Link>
      ))}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
        onClick={onLinkClick}
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Log in
      </Link>
    </div>
  );
}

function NavbarMobileNavFallback({ onLinkClick }: { onLinkClick: () => void }) {
  return (
    <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-sm border-t border-primary/10">
      {baseNavItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary ${
            item.name === 'Contact' ? 'text-white bg-primary hover:bg-primary-light' : 'text-white/90 hover:text-primary'
          }`}
          onClick={onLinkClick}
        >
          {item.name}
        </Link>
      ))}
      <Link
        href="/dashboard"
        className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={onLinkClick}
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Log in
      </Link>
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
      className={`fixed w-full z-40 left-0 top-0 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-sm border-b border-primary/10 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="relative w-[180px] sm:w-[240px] h-[60px] sm:h-[80px]">
                <Image
                  src="/logo.png"
                  alt="Stock Track PRO Logo"
                  fill
                  sizes="(max-width: 640px) 180px, 240px"
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop navigation (auth chunk loaded lazily) */}
          <div className="hidden md:block">
            <NavbarNavContent onLinkClick={closeMenu} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:text-primary hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-primary"
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

      {/* Mobile menu (auth chunk loaded lazily) */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <NavbarMobileNavContent onLinkClick={closeMenu} />
      </div>
    </nav>
  );
};

export default Navbar;
