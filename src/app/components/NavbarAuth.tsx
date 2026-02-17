'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

const baseNavigation = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

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

  const navigation = authChecked && isLoggedIn
    ? [...baseNavigation, { name: 'Dashboard', href: '/dashboard' }]
    : baseNavigation;

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
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
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
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Log out
      </button>
    );
  }
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
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
        className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
        className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Log out
      </button>
    );
  }
  return (
    <Link
      href="/dashboard"
      className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
      onClick={onLinkClick}
    >
      <LogIn className="h-4 w-4" aria-hidden />
      Log in
    </Link>
  );
}

const linkClass = (name: string) =>
  name === 'Contact'
    ? 'text-white bg-primary hover:bg-primary-light'
    : 'text-white/90 hover:text-primary';
const linkClassBase = 'px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black';
const linkClassMobile = 'block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary';

/** Desktop nav links + auth button. Dynamically imported so Firebase loads in separate chunk. */
export function NavbarNavContent({ onLinkClick }: { onLinkClick: () => void }) {
  const { navigation, isLoggedIn, authChecked, onSignOut } = useNavbarAuth();
  return (
    <div className="ml-10 flex items-center space-x-4">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`${linkClassBase} ${linkClass(item.name)}`}
          onClick={onLinkClick}
        >
          {item.name}
        </Link>
      ))}
      {authChecked ? (
        isLoggedIn ? (
          <button
            type="button"
            onClick={() => { onSignOut(); onLinkClick(); }}
            className={`inline-flex items-center gap-2 ${linkClassBase} text-white/90 hover:text-primary`}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </button>
        ) : (
          <Link href="/dashboard" className={`inline-flex items-center gap-2 ${linkClassBase} text-white/90 hover:text-primary`} onClick={onLinkClick}>
            <LogIn className="h-4 w-4" aria-hidden />
            Log in
          </Link>
        )
      ) : (
        <Link href="/dashboard" className={`inline-flex items-center gap-2 ${linkClassBase} text-white/90 hover:text-primary`}>
          <LogIn className="h-4 w-4" aria-hidden />
          Log in
        </Link>
      )}
    </div>
  );
}

/** Mobile nav links + auth button. Dynamically imported so Firebase loads in separate chunk. */
export function NavbarMobileNavContent({ onLinkClick }: { onLinkClick: () => void }) {
  const { navigation, isLoggedIn, authChecked, onSignOut } = useNavbarAuth();
  return (
    <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-sm border-t border-primary/10">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`${linkClassMobile} ${linkClass(item.name)}`}
          onClick={onLinkClick}
        >
          {item.name}
        </Link>
      ))}
      {authChecked ? (
        isLoggedIn ? (
          <button
            type="button"
            onClick={() => { onSignOut(); onLinkClick(); }}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </button>
        ) : (
          <Link href="/dashboard" className={`flex w-full items-center gap-2 ${linkClassMobile} text-white/90 hover:text-primary`} onClick={onLinkClick}>
            <LogIn className="h-4 w-4" aria-hidden />
            Log in
          </Link>
        )
      ) : (
        <Link href="/dashboard" className={`flex w-full items-center gap-2 ${linkClassMobile} text-white/90 hover:text-primary`} onClick={onLinkClick}>
          <LogIn className="h-4 w-4" aria-hidden />
          Log in
        </Link>
      )}
    </div>
  );
}
