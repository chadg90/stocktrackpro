'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import Sidebar from './components/Sidebar';
import { useRouter, usePathname } from 'next/navigation';

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

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(firebaseDb!, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        
        if (snap.exists()) {
          const data = snap.data() as Profile;
          // Check if user is manager or admin
          if (data.role === 'manager' || data.role === 'admin') {
            setAuthorized(true);
          } else {
            setAuthorized(false);
          }
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
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
      <div className="min-h-screen bg-black">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
