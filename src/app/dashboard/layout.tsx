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

type Company = {
  subscription_status?: string;
  subscription_tier?: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
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
            // Check subscription status
            if (data.company_id) {
              try {
                const companyRef = doc(firebaseDb!, 'companies', data.company_id);
                const companySnap = await getDoc(companyRef);
                if (companySnap.exists()) {
                  const companyData = companySnap.data() as Company;
                  const status = companyData.subscription_status;
                  setSubscriptionStatus(status || null);
                  
                  // Allow access if subscription is active or trial
                  if (status === 'active' || status === 'trial') {
                    setAuthorized(true);
                  } else {
                    // No active subscription - lock out
                    setAuthorized(false);
                  }
                } else {
                  // Company not found - lock out
                  setSubscriptionStatus(null);
                  setAuthorized(false);
                }
              } catch (companyError) {
                console.error('Error fetching company:', companyError);
                setSubscriptionStatus(null);
                setAuthorized(false);
              }
            } else {
              // No company_id - lock out
              setSubscriptionStatus(null);
              setAuthorized(false);
            }
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
    // Subscription lockout or unauthorized - show upgrade prompt or redirect
    if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trial') {
      // Subscription lockout - show upgrade prompt
      return (
        <ToastProvider>
          <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="dashboard-card p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Subscription Required</h2>
                  <p className="text-white/60 text-sm">
                    {subscriptionStatus === null || subscriptionStatus === 'inactive' 
                      ? 'Your subscription has expired or is inactive.'
                      : 'An active subscription is required to access the dashboard.'}
                  </p>
                </div>
                <div className="space-y-3">
                  <a
                    href="/pricing"
                    className="block w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-3 px-6 transition-colors"
                  >
                    Subscribe Now
                  </a>
                  <a
                    href="/contact"
                    className="block w-full text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ToastProvider>
      );
    }
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
        <main className="min-h-screen pt-20 lg:pt-0 lg:pl-64 bg-zinc-950/50">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <header className="flex flex-wrap items-center justify-between gap-4 mb-6 lg:mb-8">
              <div className="min-w-0 flex-1" aria-hidden />
              <div className="flex items-center gap-3">
                <div className="hidden lg:block">
                  <NotificationBell />
                </div>
              </div>
            </header>
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
