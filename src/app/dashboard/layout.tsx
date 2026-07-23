'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import Sidebar from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/Toast';
import DashboardQueryProvider from './providers/DashboardQueryProvider';
import { companyHasPaidAccess, isWebTrialExpired } from '@/lib/trialStatus';
import Link from 'next/link';

type Profile = {
  company_id?: string;
  role?: string;
};

type Company = {
  subscription_status?: string;
  subscription_tier?: string;
  trial_end_date?: unknown;
  subscription_expiry_date?: unknown;
  legacy?: boolean;
};

type ThemePreference = 'light' | 'dark';
const WHATSAPP_SUPPORT_URL = 'https://wa.me/447438146343?text=Hi%20Fleet%20Track%20PRO%20support%2C%20I%20need%20help%20with%20billing%3A';

function SubscriptionPaywall({ trialExpired }: { trialExpired: boolean }) {
  return (
    <div className="min-h-screen bg-[var(--mkt-bg,#f8fafc)] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--brand-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            {trialExpired ? 'Your free trial has ended' : 'Subscription required'}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {trialExpired
              ? 'To keep using Fleet Track PRO, subscribe and complete payment with Stripe. Your company data is kept so you can continue where you left off.'
              : 'An active subscription is required to access the dashboard. Subscribe to continue.'}
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/dashboard/subscription"
            className="block w-full btn-brand-blue text-white font-semibold rounded-xl py-3 px-6 transition-colors"
          >
            Subscribe &amp; pay
          </Link>
          <Link
            href="/pricing"
            className="block w-full rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-medium py-3 px-6 hover:bg-slate-100 transition-colors"
          >
            View pricing
          </Link>
          <a
            href={WHATSAPP_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-slate-500 hover:text-slate-800 text-sm transition-colors"
          >
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>('dark');
  const pathname = usePathname();
  const isSubscriptionPage =
    pathname === '/dashboard/subscription' || pathname?.startsWith('/dashboard/subscription/');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('stp_dashboard_theme');
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    }
  }, []);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) {
      setLoading(false);
      setAuthorized(false);
      setSignedIn(false);
      setNeedsSubscription(false);
      return;
    }

    let isMounted = true;
    let currentUserId: string | null = null;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!isMounted) return;

      if (!user) {
        currentUserId = null;
        setSignedIn(false);
        setAuthorized(false);
        setNeedsSubscription(false);
        setTrialExpired(false);
        setLoading(false);
        return;
      }

      const thisUserId = user.uid;
      currentUserId = thisUserId;
      setSignedIn(true);

      try {
        const profileRef = doc(firebaseDb!, 'profiles', user.uid);
        const snap = await getDoc(profileRef);

        if (!isMounted || currentUserId !== thisUserId) return;

        if (!snap.exists()) {
          setAuthorized(false);
          setNeedsSubscription(false);
          setTrialExpired(false);
          return;
        }

        const data = snap.data() as Profile;
        if (data.role !== 'manager' && data.role !== 'admin') {
          setAuthorized(false);
          setNeedsSubscription(false);
          setTrialExpired(false);
          return;
        }

        if (!data.company_id) {
          setAuthorized(false);
          setNeedsSubscription(false);
          setTrialExpired(false);
          return;
        }

        try {
          const companyRef = doc(firebaseDb!, 'companies', data.company_id);
          const companySnap = await getDoc(companyRef);
          if (!isMounted || currentUserId !== thisUserId) return;

          if (!companySnap.exists()) {
            setAuthorized(false);
            setNeedsSubscription(true);
            setTrialExpired(false);
            return;
          }

          const companyData = companySnap.data() as Company;
          const expired = isWebTrialExpired(companyData);
          const hasAccess = companyHasPaidAccess(companyData);
          setTrialExpired(expired);
          setAuthorized(hasAccess);
          setNeedsSubscription(!hasAccess);
        } catch (companyError) {
          console.error('Error fetching company:', companyError);
          if (!isMounted || currentUserId !== thisUserId) return;
          setAuthorized(false);
          setNeedsSubscription(true);
          setTrialExpired(false);
        }
      } catch (error) {
        if (!isMounted || currentUserId !== thisUserId) return;
        console.error('Error fetching profile:', error);
        setAuthorized(false);
        setNeedsSubscription(false);
        setTrialExpired(false);
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

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: ThemePreference = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('stp_dashboard_theme', next);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--mkt-bg,#f8fafc)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--brand-blue)]"></div>
      </div>
    );
  }

  // Manager/admin without paid access: billing page only, otherwise paywall.
  if (signedIn && needsSubscription && !authorized) {
    if (isSubscriptionPage) {
      return (
        <ToastProvider>
          <DashboardQueryProvider>
            <div className="min-h-screen bg-[var(--mkt-bg,#f8fafc)]">
              <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">{children}</div>
            </div>
          </DashboardQueryProvider>
        </ToastProvider>
      );
    }

    return (
      <ToastProvider>
        <SubscriptionPaywall trialExpired={trialExpired} />
      </ToastProvider>
    );
  }

  if (!authorized) {
    return (
      <ToastProvider>
        <DashboardQueryProvider>
          <div className="min-h-screen bg-[var(--mkt-bg,#f8fafc)]">{children}</div>
        </DashboardQueryProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <DashboardQueryProvider>
        <div
          data-theme={theme}
          className={`min-h-screen ${
            theme === 'light' ? 'bg-[#F8FAFC] text-[#0F172A] theme-light' : 'bg-black text-white theme-dark'
          }`}
        >
          <Sidebar theme={theme} onToggleTheme={toggleTheme} />
          <main
            className={`min-h-screen overflow-x-hidden pt-20 lg:pt-0 lg:pl-64 ${
              theme === 'light' ? 'bg-[#F8FAFC]' : 'bg-zinc-950/50'
            }`}
          >
            <div className="p-4 sm:p-6 lg:p-8 pb-16 sm:pb-24 max-w-[1600px] mx-auto min-h-0">
              <header
                className="dashboard-topbar flex flex-wrap items-center justify-end gap-3"
                aria-label="Dashboard toolbar"
              >
                <div className="hidden lg:block">
                  <NotificationBell />
                </div>
              </header>
              {children}
            </div>
          </main>
        </div>
      </DashboardQueryProvider>
    </ToastProvider>
  );
}
