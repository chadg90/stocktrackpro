'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Truck, Users, Settings, LogOut, AlertTriangle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import Image from 'next/image';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assets', href: '/dashboard/assets', icon: Package },
  { name: 'Fleet', href: '/dashboard/fleet', icon: Truck },
  { name: 'Defects', href: '/dashboard/defects', icon: AlertTriangle },
  { name: 'Team', href: '/dashboard/team', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    if (firebaseAuth) {
      await signOut(firebaseAuth);
    }
    // Redirect handled by page protection or auth state change
  };

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-black border-r border-primary/20">
      <div className="flex h-20 items-center px-6 border-b border-primary/20">
        <Link href="/" className="relative w-40 h-10">
          <Image
            src="/logo.png"
            alt="Stock Track PRO"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
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
  );
}
