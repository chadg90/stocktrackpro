'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

const baseNavigation = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Compliance', href: '/compliance-centre' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];
const ONBOARDING_URL = '/onboarding';

export type NavbarAuthResult = {
  navigation: typeof baseNavigation;
  isLoggedIn: boolean;
  authChecked: boolean;
  onSignOut: () => void;
  setMenuOpen: (open: boolean) => void;
};

export function useNavbarAuth(): NavbarAuthResult {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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

  const navigation = baseNavigation;

  const onSignOut = async () => {
    if (firebaseAuth) await signOut(firebaseAuth);
  };

  return {
    navigation,
    isLoggedIn,
    authChecked,
    onSignOut,
    setMenuOpen: () => {},
  };
}

export function NavbarAuthButtons({
  onSignOut,
  isLoggedIn,
  authChecked,
  onLinkClick,
}: {
  onSignOut: () => void;
  isLoggedIn: boolean;
  authChecked: boolean;
  onLinkClick: () => void;
}) {
  if (!authChecked) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Log in
      </Link>
    );
  }
  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => {
          onSignOut();
          onLinkClick();
        }}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Log out
      </button>
    );
  }
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
      onClick={onLinkClick}
    >
      <LogIn className="h-4 w-4" aria-hidden />
      Log in
    </Link>
  );
}

export function NavbarAuthButtonsMobile({
  onSignOut,
  isLoggedIn,
  authChecked,
  onLinkClick,
}: {
  onSignOut: () => void;
  isLoggedIn: boolean;
  authChecked: boolean;
  onLinkClick: () => void;
}) {
  if (!authChecked) {
    return (
      <Link
        href="/dashboard"
        className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:text-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={onLinkClick}
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Log in
      </Link>
    );
  }
  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => {
          onSignOut();
          onLinkClick();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:text-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Log out
      </button>
    );
  }
  return (
    <Link
      href="/dashboard"
      className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:text-[var(--brand-blue)] focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={onLinkClick}
    >
      <LogIn className="h-4 w-4" aria-hidden />
      Log in
    </Link>
  );
}

const linkClassBase =
  'relative px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[var(--mkt-ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white';
const linkClassMobile =
  'block px-4 py-3 rounded-xl text-base font-medium text-slate-800 hover:bg-slate-50 transition-colors';

export function NavbarNavContent({ onLinkClick }: { onLinkClick: () => void }) {
  const { navigation, isLoggedIn, authChecked, onSignOut } = useNavbarAuth();
  return (
    <div className="ml-4 lg:ml-8 flex items-center gap-0 lg:gap-0.5">
      {navigation.map((item) => (
        <Link key={item.name} href={item.href} className={linkClassBase} onClick={onLinkClick}>
          {item.name}
        </Link>
      ))}
      <div className="ml-2 lg:ml-3 pl-2 lg:pl-3 border-l border-[var(--mkt-border)] flex items-center gap-1.5 lg:gap-2">
        {!authChecked || !isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-[var(--mkt-ink)] hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
              onClick={onLinkClick}
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Log in
            </Link>
            {authChecked && (
              <Link
                href={ONBOARDING_URL}
                className="inline-flex items-center justify-center px-3 lg:px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors duration-200 btn-brand-blue whitespace-nowrap"
                onClick={onLinkClick}
              >
                Start free trial
              </Link>
            )}
          </>
        ) : (
          <>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={onLinkClick}
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                onSignOut();
                onLinkClick();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function NavbarMobileNavContent({ onLinkClick }: { onLinkClick: () => void }) {
  const { navigation, isLoggedIn, authChecked, onSignOut } = useNavbarAuth();
  return (
    <div className="px-4 pt-4 pb-6 space-y-1 bg-white border-t border-[var(--mkt-border)]">
      {navigation.map((item) => (
        <Link key={item.name} href={item.href} className={linkClassMobile} onClick={onLinkClick}>
          {item.name}
        </Link>
      ))}
      <div className="pt-4 mt-4 border-t border-[var(--mkt-border)] space-y-2">
        {authChecked && isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--mkt-border)] text-slate-800 hover:bg-slate-50"
              onClick={onLinkClick}
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                onSignOut();
                onLinkClick();
              }}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--mkt-border)] text-slate-800 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </button>
          </>
        ) : (
          <>
            {authChecked && (
              <Link
                href={ONBOARDING_URL}
                className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-white font-semibold btn-brand-blue"
                onClick={onLinkClick}
              >
                Start 14-Day Free Trial
              </Link>
            )}
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--mkt-border)] text-slate-800 hover:bg-slate-50"
              onClick={onLinkClick}
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Log in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
