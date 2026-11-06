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
  Building2,
  Menu,
  X,
  ClipboardList,
  FileText,
  CreditCard,
  Sun,
  Moon,
  Tag,
  LifeBuoy,
  ShieldCheck,
  BarChart3,
  Newspaper,
  LineChart,
  Wallet,
  ExternalLink,
  Gauge,
  FolderOpen,
} from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { GA_ADMIN_URL } from '@/lib/analytics';
import { clearCachedProfileRole, getCachedProfileRole, setCachedProfileRole } from '@/lib/sessionRoleCache';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  managerOnly?: boolean;
  adminOnly?: boolean;
  /** Open in a new tab (e.g. Google Analytics). */
  external?: boolean;
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
    label: 'Dashboard',
    items: [{ name: 'Dashboard', href: '/dashboard/', icon: LayoutDashboard }],
  },
  {
    label: 'Vehicles',
    items: [
      { name: 'Vehicles', href: '/dashboard/fleet/', icon: Truck },
      { name: 'MOT & Tax', href: '/dashboard/mot-tax/', icon: ShieldCheck, managerOnly: true },
      { name: 'Defects', href: '/dashboard/defects/', icon: AlertTriangle, managerOnly: true },
    ],
  },
  {
    label: 'Checks',
    items: [
      { name: 'Inspections', href: '/dashboard/inspections/', icon: ClipboardList },
      { name: 'Mileage', href: '/dashboard/mileage/', icon: Gauge, managerOnly: true },
    ],
  },
  {
    label: 'Reports',
    items: [
      { name: 'Fleet report', href: '/dashboard/fleet-report/', icon: FileText, managerOnly: true },
      {
        name: 'Vehicle documents',
        href: '/dashboard/vehicle-documents/',
        icon: FolderOpen,
        managerOnly: true,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Team', href: '/dashboard/team/', icon: Users },
      { name: 'Subscription', href: '/dashboard/subscription/', icon: CreditCard, managerOnly: true },
      { name: 'Help', href: '/dashboard/support/', icon: LifeBuoy },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'Admin home', href: '/dashboard/admin/', icon: LayoutDashboard, adminOnly: true },
      { name: 'Companies', href: '/dashboard/admin/companies/', icon: Building2, adminOnly: true },
      { name: 'Admin Reports', href: '/dashboard/admin/reports/', icon: BarChart3, adminOnly: true },
      { name: 'Product usage', href: '/dashboard/admin/product-usage/', icon: LineChart, adminOnly: true },
      { name: 'Promo Codes', href: '/dashboard/admin/promo-codes/', icon: Tag, adminOnly: true },
      { name: 'Referrals', href: '/dashboard/admin/referrals/', icon: Users, adminOnly: true },
      { name: 'Compliance articles', href: '/dashboard/admin/compliance-articles/', icon: Newspaper, adminOnly: true },
      { name: 'Billing & storage', href: '/dashboard/admin/billing/', icon: Wallet, adminOnly: true },
      {
        name: 'Website analytics',
        href: GA_ADMIN_URL,
        icon: ExternalLink,
        adminOnly: true,
        external: true,
      },
    ],
  },
];

export default function Sidebar({ theme, onToggleTheme }: SidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !firebaseAuth?.currentUser) return null;
    return getCachedProfileRole(firebaseAuth.currentUser.uid);
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const cached = getCachedProfileRole(user.uid);
        if (cached) setUserRole(cached);

        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const role = String(snap.data().role || '') || null;
          if (role) setCachedProfileRole(user.uid, role);
          setUserRole(role);
        }
      } else {
        clearCachedProfileRole();
        setUserRole(null);
      }
    });

    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    clearCachedProfileRole();
    if (firebaseAuth) {
      await signOut(firebaseAuth);
    }
    // Redirect handled by page protection or auth state change
  };

  return (
    <>
      {/* Open menu — hidden while the drawer is open so it does not cover the logo */}
      {!mobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`lg:hidden fixed top-4 left-4 z-[100] p-2 rounded-lg shadow-lg transition-colors ${
            theme === 'light'
              ? 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50'
              : 'bg-black/90 border border-blue-500/30 text-white hover:bg-blue-500/10'
          }`}
          aria-label="Open menu"
          aria-expanded={false}
          aria-controls="sidebar-navigation"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

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
        <div className="flex h-20 items-center gap-2 px-3 border-b border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden shrink-0 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className="relative h-12 flex-1 min-w-0 max-w-[200px] flex items-center"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fleet Track PRO home"
          >
            <Image
              src="/logo-white.png"
              alt="Fleet Track PRO"
              fill
              sizes="200px"
              style={{ objectFit: 'contain', objectPosition: 'left center' }}
              priority
              className="object-left"
            />
          </Link>
          <div className="flex items-center gap-2 shrink-0">
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
                      !item.external &&
                      (item.href === '/dashboard' || item.href === '/dashboard/'
                        ? pathname === '/dashboard' || pathname === '/dashboard/'
                        : pathname === item.href || (!!pathname && pathname.startsWith(`${item.href}/`)));
                    const className = `flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                    }`;
                    if (item.external) {
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className={className}
                        >
                          <item.icon className="h-4 w-4 shrink-0 text-white/50" />
                          <span className="truncate">{item.name}</span>
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          setMobileMenuOpen(false);
                        }}
                        className={className}
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
