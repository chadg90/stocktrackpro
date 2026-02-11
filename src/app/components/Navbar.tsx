'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!firebaseAuth) {
      setAuthChecked(true);
      return;
    }
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setIsLoggedIn(!!user);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    if (firebaseAuth) await signOut(firebaseAuth);
    setIsMenuOpen(false);
  };

  const baseNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];
  const navigation = authChecked && isLoggedIn
    ? [...baseNavigation, { name: 'Dashboard', href: '/dashboard' }]
    : baseNavigation;

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
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black ${
                    item.name === 'Contact'
                      ? 'text-white bg-primary hover:bg-primary-light'
                      : 'text-white/90 hover:text-primary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {authChecked && (
                isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    Log out
                  </button>
                ) : (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" aria-hidden />
                    Log in
                  </Link>
                )
              )}
            </div>
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

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-sm border-t border-primary/10">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary ${
                item.name === 'Contact'
                  ? 'text-white bg-primary hover:bg-primary-light'
                  : 'text-white/90 hover:text-primary'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {authChecked && (
            isLoggedIn ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Log out
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="h-4 w-4" aria-hidden />
                Log in
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
