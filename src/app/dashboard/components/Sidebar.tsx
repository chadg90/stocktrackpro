'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Users,
  LogOut,
  AlertTriangle,
  History,
  MapPin,
  Building2,
  Gauge,
  Menu,
  X,
  ClipboardList,
  CreditCard,
  Sun,
  Moon,
  Tag,
  LifeBuoy,
  ShieldCheck,
} from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  managerOnly?: boolean;
  adminOnly?: boolean;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

type ThemePreference = 'light' | 'dark';

type SidebarProps = {
  theme: ThemePreference;
  onToggleTheme: () => void;
};

// Organized navigation groups
const navigationGroups: NavigationGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Fleet',
    items: [
      { name: 'Fleet', href: '/dashboard/fleet', icon: Truck },
      { name: 'Locations', href: '/dashboard/locations', icon: MapPin },
    ]
  },
  {
    label: 'Reports',
    items: [
      { name: 'Fleet report', href: '/dashboard/fleet-report', icon: ClipboardList, managerOnly: true },
      { name: 'MOT & Tax', href: '/dashboard/mot-tax', icon: ShieldCheck, managerOnly: true },
      { name: 'Mileage monitor', href: '/dashboard/mileage-monitor', icon: Gauge, managerOnly: true },
      { name: 'Defects', href: '/dashboard/defects', icon: AlertTriangle, managerOnly: true },
      { name: 'Audit log', href: '/dashboard/history', icon: History },
    ]
  },
  {
    label: 'Team & Access',
    items: [
      { name: 'Team', href: '/dashboard/team', icon: Users },
    ]
  },
  {
    label: 'Settings',
    items: [
      { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard, managerOnly: true },
      { name: 'Companies', href: '/dashboard/companies', icon: Building2, adminOnly: true },
    ]
  },
  {
    label: 'Support',
    items: [
      { name: 'WhatsApp Support', href: '/dashboard/support', icon: LifeBuoy },
    ]
  },
  {
    label: 'Admin',
    items: [
      { name: 'Promo Codes', href: '/dashboard/admin/promo-codes', icon: Tag, adminOnly: true },
    ]
  },
];

export default function Sidebar({ theme, onToggleTheme }: SidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-black/90 border border-blue-500/30 rounded-lg text-white hover:bg-blue-500/10 transition-colors shadow-lg"
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
        className={`flex h-screen w-64 flex-col fixed inset-y-0 z-[95] bg-black border-r border-white/10 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      onClick={(e) => {
        // Prevent clicks inside sidebar from closing it
        e.stopPropagation();
      }}
      >
        <div className="flex h-20 items-center justify-between px-5 border-b border-white/10 shrink-0">
          <Link
            href="/"
            className="relative w-36 h-9 flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="Stock Track PRO"
              fill
              style={{ objectFit: 'contain' }}
              priority
              className="object-left"
            />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/60 text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-2 focus:ring-offset-black"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <div className="lg:hidden">
              <NotificationBell />
            </div>
          </div>
        </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 min-h-0">
        <nav className="space-y-4">
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
                <p className="px-2 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      item.href === '/dashboard' || item.href === '/dashboard/'
                        ? pathname === '/dashboard' || pathname === '/dashboard/'
                        : pathname === item.href || (!!pathname && pathname.startsWith(`${item.href}/`));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                            : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-500' : 'text-white/50'}`} />
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

      <div className="p-2 border-t border-white/10 shrink-0 bg-black">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 px-2 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black"
        >
          <LogOut className="h-4 w-4 shrink-0 text-white/50" />
          Sign Out
        </button>
      </div>
      </nav>
    </>
  );
}
