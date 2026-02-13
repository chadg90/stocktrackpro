'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { CreditCard, Check, ExternalLink, AlertCircle, Calendar, Sparkles, Tag, X } from 'lucide-react';
import Link from 'next/link';

type Profile = {
  company_id?: string;
  role?: string;
};

type Company = {
  subscription_status?: string;
  subscription_tier?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  trial_end_date?: any;
};

type TierId = 'PRO_STARTER' | 'PRO_TEAM' | 'PRO_BUSINESS' | 'PRO_ENTERPRISE';

type Tier = {
  id: TierId;
  name: string;
  description: string;
  price: number;
  features: string[];
};

const tiers: Tier[] = [
  {
    id: 'PRO_STARTER',
    name: "Starter",
    description: "Perfect for individual users",
    price: 19.99,
    features: [
      "Up to 1 user",
      "Track up to 50 assets",
      "Up to 5 vehicles",
      "QR code scanning",
      "Vehicle inspections",
      "Fleet and asset management",
      "7-day free trial for new users",
    ]
  },
  {
    id: 'PRO_TEAM',
    name: "Team",
    description: "Ideal for small teams",
    price: 34.99,
    features: [
      "Up to 10 users",
      "Track up to 500 assets",
      "Up to 15 vehicles",
      "Vehicle inspections and defect workflow",
      "Full company dashboard",
      "Priority email support",
      "7-day free trial for new users",
    ]
  },
  {
    id: 'PRO_BUSINESS',
    name: "Business",
    description: "For growing businesses",
    price: 49.99,
    features: [
      "Up to 40 users",
      "Up to 1,500 assets",
      "Up to 40 vehicles",
      "All features included",
      "Admin and manager roles",
      "Full audit trail",
      "7-day free trial for new users",
    ]
  },
  {
    id: 'PRO_ENTERPRISE',
    name: "Enterprise",
    description: "For large enterprises",
    price: 119.99,
    features: [
      "Up to 75 users",
      "Up to 1,500 assets",
      "Up to 150 vehicles",
      "Custom onboarding",
      "Dedicated support",
      "All features included",
      "7-day free trial for new users",
    ]
  }
];

const formatPrice = (price: number) => {
  return `£${price.toFixed(2)}`;
};

const formatTierName = (tier?: string) => {
  if (!tier) return 'None';
  const tierMap: Record<string, string> = {
    'PRO_STARTER': 'Starter',
    'PRO_TEAM': 'Team',
    'PRO_BUSINESS': 'Business',
    'PRO_ENTERPRISE': 'Enterprise',
  };
  return tierMap[tier] || tier;
};

export default function SubscriptionPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<TierId | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [promoCodeValidating, setPromoCodeValidating] = useState(false);
  const [validatedPromoCode, setValidatedPromoCode] = useState<string | null>(null);

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
        setLoading(false);
        return;
      }

      setAuthUser(user);
      try {
        const profileSnap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
        if (profileSnap.exists()) {
          const profileData = profileSnap.data() as Profile;
          setProfile(profileData);

          if (profileData.company_id) {
            const companySnap = await getDoc(doc(firebaseDb, 'companies', profileData.company_id));
            if (companySnap.exists()) {
              setCompany(companySnap.data() as Company);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

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

  const validatePromoCode = async () => {
    if (!promoCode.trim() || !firebaseDb) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    if (!profile?.company_id || !authUser) {
      setPromoCodeError('Please log in to use a promo code');
      return;
    }

    setPromoCodeValidating(true);
    setPromoCodeError(null);
    
    try {
      const trimmedCode = promoCode.trim().toUpperCase();
      const promoCodeRef = doc(firebaseDb, 'promoCodes', trimmedCode);
      const promoSnap = await getDoc(promoCodeRef);
      
      if (!promoSnap.exists()) {
        setPromoCodeError('Invalid promo code');
        setValidatedPromoCode(null);
        setPromoCodeValidating(false);
        return;
      }
      
      const promoData = promoSnap.data();
      
      // Check if code is expired
      if (promoData?.expiresAt) {
        const expiresAt = promoData.expiresAt.toDate ? promoData.expiresAt.toDate() : new Date(promoData.expiresAt);
        if (expiresAt < new Date()) {
          setPromoCodeError('This promo code has expired');
          setValidatedPromoCode(null);
          setPromoCodeValidating(false);
          return;
        }
      }
      
      // Check if code has reached max uses
      if (promoData?.maxUses && promoData?.usedCount >= promoData.maxUses) {
        setPromoCodeError('This promo code has reached its usage limit');
        setValidatedPromoCode(null);
        setPromoCodeValidating(false);
        return;
      }
      
      // Check if code is already used (single-use codes)
      if (promoData?.used === true && !promoData?.maxUses) {
        setPromoCodeError('This promo code has already been used');
        setValidatedPromoCode(null);
        setPromoCodeValidating(false);
        return;
      }
      
      // Valid promo code - immediately start checkout
      setValidatedPromoCode(trimmedCode);
      setPromoCodeError(null);
      
      // Determine which tier to use
      // If no active subscription, default to Starter
      // If has subscription, use current tier (for renewal/upgrade)
      const tierToUse = subscriptionStatus === 'active' || subscriptionStatus === 'trial' 
        ? (currentTier as TierId) || 'PRO_STARTER'
        : 'PRO_STARTER';
      
      // Start checkout immediately
      await handleSubscribe(tierToUse);
      
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoCodeError('Failed to validate promo code. Please try again.');
      setValidatedPromoCode(null);
    } finally {
      setPromoCodeValidating(false);
    }
  };

  const clearPromoCode = () => {
    setPromoCode('');
    setValidatedPromoCode(null);
    setPromoCodeError(null);
  };

  const handleSubscribe = async (tier: TierId) => {
    if (!profile?.company_id || !authUser) return;
    setCheckoutError(null);
    setPromoCodeError(null);
    setCheckoutLoading(tier);
    try {
      const token = await authUser.getIdToken();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          tier, 
          company_id: profile.company_id,
          promo_code: validatedPromoCode || promoCode.trim() || undefined,
        }),
        signal: AbortSignal.timeout(25000),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
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
        if (e.name === 'AbortError' || e.message.includes('timeout')) {
          message = 'Request timed out. The server may be slow. Please try again.';
        } else {
          message = e.message;
        }
      }
      setCheckoutError(message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <Check className="w-4 h-4" />
            Active
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Calendar className="w-4 h-4" />
            7-Day Free Trial
          </span>
        );
      case 'inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
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
        day: 'numeric' 
      });
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const canManage = profile?.role === 'manager' || profile?.role === 'admin';
  const currentTier = company?.subscription_tier;
  const subscriptionStatus = company?.subscription_status;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
        <p className="text-white/60">View your subscription status and manage your plan</p>
      </div>

      {/* Current Subscription Status */}
      <div className="dashboard-card p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-primary" />
              Current Subscription
            </h2>
            <p className="text-white/60">Your current plan and billing information</p>
          </div>
          {getStatusBadge(subscriptionStatus)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Plan</p>
            <p className="text-white font-semibold text-lg">{formatTierName(currentTier)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Status</p>
            <p className="text-white font-semibold text-lg capitalize">{subscriptionStatus || 'Inactive'}</p>
          </div>
          {subscriptionStatus === 'trial' && company?.trial_end_date && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Trial Ends</p>
              <p className="text-white font-semibold text-lg">{formatTrialEndDate(company.trial_end_date) || 'N/A'}</p>
            </div>
          )}
          {company?.stripe_customer_id && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Billing</p>
              <p className="text-white font-semibold text-lg">Stripe</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {canManage && company?.stripe_customer_id && (
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-black font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-lg shadow-primary/20"
            >
              <ExternalLink className="w-4 h-4" />
              {portalLoading ? 'Opening...' : 'Manage Billing Portal'}
            </button>
          )}
        </div>

        {subscriptionStatus !== 'active' && subscriptionStatus !== 'trial' && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Your subscription is inactive. Subscribe to continue using the dashboard.
            </p>
          </div>
        )}
      </div>

      {/* Promo Code Section */}
      {canManage && (
        <div className="dashboard-card p-8">
          <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
            <Tag className="w-6 h-6 text-primary" />
            Promo Code Checkout
          </h2>
          <p className="text-white/60 mb-6">Enter a promo code to validate and proceed directly to checkout</p>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoCodeError(null);
                  setValidatedPromoCode(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && promoCode.trim() && !promoCodeValidating) {
                    validatePromoCode();
                  }
                }}
                placeholder="Enter promo code"
                disabled={promoCodeValidating}
                className={`w-full rounded-lg bg-white/5 border px-4 py-3 pr-10 text-white placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase font-medium ${
                  validatedPromoCode 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : promoCodeError 
                    ? 'border-red-500/50 bg-red-500/10' 
                    : 'border-white/20'
                } disabled:opacity-50`}
              />
              {validatedPromoCode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
              )}
            </div>
            <button
              onClick={validatePromoCode}
              disabled={!promoCode.trim() || promoCodeValidating}
              className="px-6 py-3 bg-primary hover:bg-primary-light text-black rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              {promoCodeValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Validate & Checkout
                </>
              )}
            </button>
          </div>
          
          {validatedPromoCode && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Promo code <span className="font-semibold">{validatedPromoCode}</span> validated. Redirecting to checkout...
              </p>
            </div>
          )}
          
          {promoCodeError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {promoCodeError}
              </p>
            </div>
          )}
          
          <p className="text-white/40 text-sm mt-4">
            {subscriptionStatus === 'active' || subscriptionStatus === 'trial' 
              ? `Checkout will use your current plan (${formatTierName(currentTier)})`
              : 'Checkout will use the Starter plan by default'}
          </p>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">Available Plans</h2>
          <p className="text-white/60">Choose the plan that best fits your needs</p>
        </div>
        {checkoutError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {checkoutError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const isCurrentTier = currentTier === tier.id;
            const isUpgrade = currentTier && 
              ['PRO_STARTER', 'PRO_TEAM', 'PRO_BUSINESS'].includes(currentTier) &&
              ['PRO_TEAM', 'PRO_BUSINESS', 'PRO_ENTERPRISE'].includes(tier.id) &&
              tier.id !== currentTier;
            
            return (
              <div
                key={tier.id}
                className={`dashboard-card p-6 flex flex-col transition-all hover:scale-[1.02] ${
                  isCurrentTier ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : 'hover:border-primary/30'
                }`}
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    {isCurrentTier && (
                      <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold">Current</span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mb-4">{tier.description}</p>
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <span className="text-3xl font-bold text-white">{formatPrice(tier.price)}</span>
                    <span className="text-white/60 text-sm ml-2">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-white/90">
                      <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {canManage && (
                  <button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={checkoutLoading === tier.id || isCurrentTier}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      isCurrentTier
                        ? 'bg-white/10 text-white/60 cursor-not-allowed'
                        : isUpgrade
                        ? 'bg-primary hover:bg-primary-light text-black shadow-lg shadow-primary/20'
                        : subscriptionStatus !== 'active' && subscriptionStatus !== 'trial'
                        ? 'bg-primary hover:bg-primary-light text-black shadow-lg shadow-primary/20'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    } disabled:opacity-50`}
                  >
                    {checkoutLoading === tier.id
                      ? 'Processing...'
                      : isCurrentTier
                      ? 'Current Plan'
                      : isUpgrade
                      ? 'Upgrade Now'
                      : subscriptionStatus !== 'active' && subscriptionStatus !== 'trial'
                      ? 'Subscribe Now'
                      : 'Change Plan'}
                  </button>
                )}

                {!canManage && (
                  <div className="text-center py-3 px-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/40 text-xs">
                      Only managers and admins can manage subscriptions
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="dashboard-card p-8 bg-gradient-to-br from-white/5 to-transparent border-primary/20">
        <h2 className="text-2xl font-semibold text-white mb-3">Need Help?</h2>
        <p className="text-white/60 mb-6">
          If you have questions about your subscription or need assistance, we're here to help.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            Contact Support
            <ExternalLink className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            View Pricing Details
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
