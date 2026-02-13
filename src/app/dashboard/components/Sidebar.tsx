'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Truck, Users, LogOut, AlertTriangle, History, MapPin, Key, Building2, Menu, X, BarChart3, CreditCard, ExternalLink } from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

// Organized navigation groups
const navigationGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Assets & Fleet',
    items: [
      { name: 'Fleet', href: '/dashboard/fleet', icon: Truck },
      { name: 'Assets', href: '/dashboard/assets', icon: Package },
      { name: 'Locations', href: '/dashboard/locations', icon: MapPin },
    ]
  },
  {
    label: 'Reports & Analytics',
    items: [
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Activity History', href: '/dashboard/history', icon: History },
      { name: 'Defects', href: '/dashboard/defects', icon: AlertTriangle, managerOnly: true },
    ]
  },
  {
    label: 'Team & Access',
    items: [
      { name: 'Team', href: '/dashboard/team', icon: Users },
      { name: 'Access Codes', href: '/dashboard/access-codes', icon: Key },
    ]
  },
  {
    label: 'Settings',
    items: [
      { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard, managerOnly: true },
      { name: 'Companies', href: '/dashboard/companies', icon: Building2, adminOnly: true },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          setUserRole(snap.data().role || null);
        }
      }
    });

    return () => unsub();
  }, []);

  const handleManageSubscription = async () => {
    if (!firebaseAuth?.currentUser) return;
    setPortalLoading(true);
    try {
      const token = await firebaseAuth.currentUser.getIdToken();
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open billing');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Could not open billing portal. Subscribe first from the pricing page.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (firebaseAuth) {
      await signOut(firebaseAuth);
    }
    // Redirect handled by page protection or auth state change
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-black/90 border border-primary/30 rounded-lg text-white hover:bg-primary/10 transition-colors shadow-lg"
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileMenuOpen}
        aria-controls="sidebar-navigation"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-[90]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav 
        id="sidebar-navigation"
        role="navigation"
        aria-label="Main navigation"
        className={`flex h-full w-64 flex-col fixed inset-y-0 z-[95] bg-black border-r border-white/10 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      onClick={(e) => {
        // Prevent clicks inside sidebar from closing it
        e.stopPropagation();
      }}
      >
        <div className="flex h-20 items-center justify-between px-5 border-b border-white/10 shrink-0">
          <Link href="/" className="relative w-36 h-9 flex items-center" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/logo.png"
              alt="Stock Track PRO"
              fill
              style={{ objectFit: 'contain' }}
              priority
              className="object-left"
            />
          </Link>
          <div className="lg:hidden">
            <NotificationBell />
          </div>
        </div>

      <div className="flex-1 overflow-y-auto py-5 px-3">
        <nav className="space-y-6">
          {navigationGroups.map((group) => {
            // Filter items based on role
            const visibleItems = group.items.filter(item => {
              // Admin-only items: only show to admins
              if (item.adminOnly && userRole !== 'admin') return false;
              // Manager-only items: show to managers AND admins (admins have higher privileges)
              if (item.managerOnly && userRole !== 'manager' && userRole !== 'admin') return false;
              return true;
            });

            // Don't render group if no items are visible
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label}>
                <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href === '/dashboard' && pathname === '/dashboard') ||
                      (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-white/50'}`} />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-white/10 space-y-1 shrink-0">
        {(userRole === 'manager' || userRole === 'admin') && (
          <button
            type="button"
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Manage subscription"
          >
            <ExternalLink className="h-5 w-5 shrink-0 text-white/50" />
            <span className="truncate">{portalLoading ? 'Opening…' : 'Manage subscription'}</span>
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-black"
        >
          <LogOut className="h-5 w-5 shrink-0 text-white/50" />
          Sign Out
        </button>
      </div>
      </nav>
    </>
  );
}
