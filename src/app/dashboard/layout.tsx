'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import Sidebar from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import { useRouter, usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/Toast';

type Profile = {
  company_id?: string;
  role?: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardRoot = pathname === '/dashboard' || pathname === '/dashboard/';

  useEffect(() => {
    // Only run on client side and if firebase is initialized
    if (!firebaseAuth || !firebaseDb) {
      // Firebase not available - stop loading and show login
      setLoading(false);
      setAuthorized(false);
      return;
    }

    // Track if the component is still mounted to prevent race conditions
    let isMounted = true;
    // Track current user ID to handle rapid auth state changes
    let currentUserId: string | null = null;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      // If user changed while we were processing, ignore stale results
      if (!isMounted) return;
      
      if (!user) {
        currentUserId = null;
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // Track this user to detect if another auth change happens
      const thisUserId = user.uid;
      currentUserId = thisUserId;

      try {
        const profileRef = doc(firebaseDb!, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        
        // Check if we're still mounted and this is still the current user
        if (!isMounted || currentUserId !== thisUserId) return;
        
        if (snap.exists()) {
          const data = snap.data() as Profile;
          // Only allow managers and admins to access dashboard
          // Block users with role "user"
          if (data.role === 'manager' || data.role === 'admin') {
            setAuthorized(true);
          } else {
            // User role or any other role is not allowed
            setAuthorized(false);
          }
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        if (!isMounted || currentUserId !== thisUserId) return;
        console.error('Error fetching profile:', error);
        setAuthorized(false);
      } finally {
        if (isMounted && currentUserId === thisUserId) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authorized && !isDashboardRoot) {
    // Redirect sub-pages to main dashboard for login
    if (typeof window !== 'undefined') {
      router.push('/dashboard');
    }
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authorized) {
    // On /dashboard page, show login form without sidebar
    return (
      <ToastProvider>
        <div className="min-h-screen bg-black">
          {children}
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-black">
        <Sidebar />
        <main className="min-h-screen pt-20 lg:pt-0 lg:pl-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-end mb-4">
              <div className="hidden lg:block">
                <NotificationBell />
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
