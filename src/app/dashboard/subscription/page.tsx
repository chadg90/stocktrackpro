'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { CreditCard, Check, ExternalLink, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

const PRICE_PER_VEHICLE = 8;
const MIN_VEHICLES = 5;
const MAX_VEHICLES = 100;
const WHATSAPP_SUPPORT_URL = 'https://wa.me/447438146343?text=Hi%20Stock%20Track%20PRO%20support%2C%20I%20need%20help%20with%20billing%3A';

type Profile = {
  company_id?: string;
  role?: string;
};

type Company = {
  subscription_status?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  subscription_type?: string;
  trial_end_date?: any;
  subscribed_vehicles?: number;
  legacy?: boolean;
};

type Tier = { label: string; assets: string; users: string; colour: string };

function getTier(count: number): Tier {
  if (count <= 15)
    return { label: 'Starter', assets: '1,000 assets', users: 'Up to 15 users', colour: 'text-sky-800 dark:text-sky-400' };
  if (count <= 35)
    return { label: 'Growth', assets: '5,000 assets', users: 'Up to 35 users', colour: 'text-indigo-800 dark:text-indigo-400' };
  if (count <= 75)
    return { label: 'Business', assets: '20,000 assets', users: 'Up to 75 users', colour: 'text-violet-800 dark:text-violet-400' };
  return { label: 'Enterprise', assets: 'Unlimited assets', users: 'Unlimited users', colour: 'text-blue-800 dark:text-blue-400' };
}

const formatCurrency = (value: number) => `£${value.toFixed(2)}`;

export default function SubscriptionPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [vehicleCount, setVehicleCount] = useState<number>(MIN_VEHICLES);

  const loadSubscriptionData = async (user: User) => {
    if (!firebaseDb) return;
    setLoading(true);
    setLoadError(null);
    try {
      const profileSnap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as Profile;
        setProfile(profileData);

        if (profileData.company_id) {
          const companySnap = await getDoc(doc(firebaseDb, 'companies', profileData.company_id));
          if (companySnap.exists()) {
            const companyData = companySnap.data() as Company;
            setCompany(companyData);
            if (companyData.subscribed_vehicles && companyData.subscribed_vehicles >= MIN_VEHICLES) {
              setVehicleCount(Math.min(companyData.subscribed_vehicles, MAX_VEHICLES));
            } else {
              setVehicleCount(MIN_VEHICLES);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoadError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) {
        setProfile(null);
        setCompany(null);
        setAuthUser(null);
        setLoadError(null);
        setLoading(false);
        return;
      }
      setAuthUser(user);
      loadSubscriptionData(user);
    });

    return () => unsub();
  }, []);

  const handleSubscribe = async () => {
    if (!profile?.company_id || !authUser) return;
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const token = await authUser.getIdToken();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicle_count: vehicleCount,
          company_id: profile.company_id,
        }),
        signal: AbortSignal.timeout(25000),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server error (${res.status}). ${res.status === 504 ? 'Request timed out. Please try again.' : 'Please check server logs.'}`);
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Checkout failed (${res.status})`);
      }
      if (data.url) window.location.href = data.url;
      else throw new Error('No checkout URL');
    } catch (e) {
      let message = 'Something went wrong';
      if (e instanceof Error) {
        message = e.name === 'AbortError' || e.message.includes('timeout')
          ? 'Request timed out. The server may be slow. Please try again.'
          : e.message;
      }
      setCheckoutError(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!authUser) return;
    setPortalLoading(true);
    try {
      const token = await authUser.getIdToken();
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open billing portal');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Could not open billing portal. Subscribe first from the pricing page.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSyncSubscription = async () => {
    if (!authUser) return;
    setSyncing(true);
    try {
      const token = await authUser.getIdToken();
      const res = await fetch('/api/sync-subscription', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync subscription');
      await loadSubscriptionData(authUser);
      if (data.synced === false && data.message) {
        alert(data.message);
      } else {
        alert('Subscription synced successfully!');
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Could not sync subscription.');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
            <Check className="w-4 h-4" />
            Active
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-950 border border-amber-400 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40">
            <Calendar className="w-4 h-4" />
            7-Day Free Trial
          </span>
        );
      case 'inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
            <AlertCircle className="w-4 h-4" />
            Inactive
          </span>
        );
    }
  };

  const formatTrialEndDate = (trialEndDate: any) => {
    if (!trialEndDate) return null;
    try {
      const date = trialEndDate.toDate ? trialEndDate.toDate() : new Date(trialEndDate);
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const canManage = profile?.role === 'manager' || profile?.role === 'admin';
  const subscriptionStatus = company?.subscription_status;
  const tier = getTier(vehicleCount);
  const effectiveTier = company?.legacy
    ? { label: 'Legacy Plan', assets: 'As agreed', users: 'As agreed', colour: 'text-amber-700 dark:text-amber-300' }
    : tier;
  const currentVehicles = company?.subscribed_vehicles || 0;
  const monthlyTotal = vehicleCount * PRICE_PER_VEHICLE;

  return (
    <div className="space-y-8">
      {loadError && authUser && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-wrap items-center justify-between gap-2 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100"
          role="alert"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => loadSubscriptionData(authUser)}
            className="text-blue-600 hover:underline font-medium whitespace-nowrap dark:text-blue-400"
          >
            Try again
          </button>
        </div>
      )}

      <div className="border-b border-zinc-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Subscription Management</h1>
        <p className="text-zinc-600 dark:text-white/75">Per-vehicle billing via Stripe. Adjust your fleet size and manage billing here.</p>
      </div>

      {company?.legacy && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="text-amber-900 dark:text-amber-100 font-semibold">
            Legacy pricing: your company remains on its initial agreed price long term.
          </p>
          <p className="text-amber-800 dark:text-amber-200/90 text-sm mt-1">
            This account is excluded from new per-vehicle pricing unless you request a plan change.
          </p>
        </div>
      )}

      <div className="dashboard-card p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-blue-500" />
              Current Subscription
            </h2>
            <p className="text-white/75">Status and billing controls</p>
          </div>
          {getStatusBadge(subscriptionStatus)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Current Vehicles</p>
            <p className="text-white font-semibold text-lg">
              {company?.legacy ? 'Legacy plan' : (currentVehicles || 'Not set')}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Estimated Monthly</p>
            <p className="text-white font-semibold text-lg">
              {company?.legacy ? 'Legacy pricing' : (currentVehicles ? formatCurrency(currentVehicles * PRICE_PER_VEHICLE) : '—')}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Feature Tier</p>
            <p className={`font-semibold text-lg ${effectiveTier.colour}`}>{effectiveTier.label}</p>
          </div>
          {subscriptionStatus === 'trial' && company?.trial_end_date ? (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Trial Ends</p>
              <p className="text-white font-semibold text-lg">{formatTrialEndDate(company.trial_end_date) || 'N/A'}</p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Billing</p>
              <p className="text-white font-semibold text-lg">{company?.stripe_customer_id ? 'Stripe (website)' : 'Not linked yet'}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {canManage && (
            <>
              <button
                onClick={handleManageBilling}
                disabled={portalLoading || !company?.stripe_customer_id}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                {portalLoading ? 'Opening...' : 'Manage Billing Portal'}
              </button>
              <button
                onClick={handleSyncSubscription}
                disabled={syncing}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {company?.stripe_subscription_id ? 'Sync Subscription' : 'Find & Sync Subscription'}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {canManage && (
        <div className="dashboard-card p-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Update Vehicle Count</h2>
          <p className="text-white/75 mb-6">
            £{PRICE_PER_VEHICLE} per vehicle per month (minimum {MIN_VEHICLES}). Changes apply from your next billing cycle.
          </p>

          {checkoutError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-200">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {checkoutError}
            </div>
          )}

          <div className="max-w-2xl">
            <div className="flex items-center justify-between text-sm text-white/60 mb-3">
              <span>Vehicles</span>
              <span className="text-white font-semibold">{vehicleCount}</span>
            </div>
            <input
              type="range"
              min={MIN_VEHICLES}
              max={MAX_VEHICLES}
              step={1}
              value={vehicleCount}
              onChange={(e) => setVehicleCount(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((vehicleCount - MIN_VEHICLES) / (MAX_VEHICLES - MIN_VEHICLES)) * 100}%, rgba(255,255,255,0.1) ${((vehicleCount - MIN_VEHICLES) / (MAX_VEHICLES - MIN_VEHICLES)) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
              aria-label="Number of vehicles"
            />
            <div className="flex justify-between text-xs text-white/30 mt-2">
              <span>{MIN_VEHICLES} min</span>
              <span>{MAX_VEHICLES}+</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-white/60">Estimated monthly total</span>
              <span className="text-white font-semibold">{formatCurrency(monthlyTotal)}</span>
            </div>
            <div className="mt-2 text-sm text-white/70">
              <span className={effectiveTier.colour}>{effectiveTier.label}</span> includes {effectiveTier.assets}, {effectiveTier.users}
            </div>
            <button
              onClick={handleSubscribe}
              disabled={checkoutLoading}
              className="mt-6 w-full py-3 px-4 rounded-lg font-semibold transition-all bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {checkoutLoading ? 'Processing...' : `Continue to Checkout — ${formatCurrency(monthlyTotal)}/month`}
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-card p-8 bg-gradient-to-br from-white/5 to-transparent border-blue-500/20">
        <h2 className="text-2xl font-semibold text-white mb-3">Need Help?</h2>
        <p className="text-white/80 mb-6">
          If you have questions about billing or need help changing your vehicle count, contact support.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href={WHATSAPP_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            WhatsApp Support
            <ExternalLink className="w-4 h-4" />
          </a>
          <Link
            href="/pricing"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            View Public Pricing
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
