'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Truck, Users, Settings, LogOut, AlertTriangle, History, MapPin, Key, Building2, Menu, X, BarChart3 } from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assets', href: '/dashboard/assets', icon: Package },
  { name: 'Fleet', href: '/dashboard/fleet', icon: Truck },
  { name: 'Defects', href: '/dashboard/defects', icon: AlertTriangle, managerOnly: true },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Locations', href: '/dashboard/locations', icon: MapPin },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Access Codes', href: '/dashboard/access-codes', icon: Key },
  { name: 'Companies', href: '/dashboard/companies', icon: Building2, adminOnly: true },
];

export default function Sidebar() {
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
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-black/90 border border-primary/30 rounded-lg text-white hover:bg-primary/10 transition-colors shadow-lg"
        aria-label="Toggle menu"
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
      <div className={`flex h-full w-64 flex-col fixed inset-y-0 z-[95] bg-black border-r border-primary/20 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      onClick={(e) => {
        // Prevent clicks inside sidebar from closing it
        e.stopPropagation();
      }}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-primary/20">
          <Link href="/" className="relative w-40 h-10" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/logo.png"
              alt="Stock Track PRO"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
          <div className="lg:hidden">
            <NotificationBell />
          </div>
        </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-2">
          {navigation
            .filter(item => {
              if (item.adminOnly && userRole !== 'admin') return false;
              if (item.managerOnly && userRole !== 'manager') return false;
              return true;
            })
            .map((item) => {
              const isActive = pathname === item.href || (item.href === '/dashboard' && pathname?.startsWith('/dashboard'));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-white/50'}`} />
                  {item.name}
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="p-4 border-t border-primary/20">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 text-white/50" />
          Sign Out
        </button>
      </div>
      </div>
    </>
  );
}
