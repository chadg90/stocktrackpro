'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';

type TierId = 'PRO_STARTER' | 'PRO_TEAM' | 'PRO_BUSINESS' | 'PRO_ENTERPRISE';

type Tier = {
  id: TierId;
  name: string;
  description: string;
  price: number;
  features: string[];
  enterpriseNote?: boolean;
};

export default function Pricing() {
  const [profile, setProfile] = useState<{ company_id?: string; role?: string } | null>(null);
  const [authUser, setAuthUser] = useState<{ getIdToken: () => Promise<string> } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<TierId | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [promoCodeValidating, setPromoCodeValidating] = useState(false);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) {
      setAuthLoading(false);
      return;
    }
    const db = firebaseDb;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !db) {
        setProfile(null);
        setAuthUser(null);
        setAuthLoading(false);
        return;
      }
      setAuthUser(user);
      try {
        const snap = await getDoc(doc(db, 'profiles', user.uid));
        setProfile(snap.exists() ? (snap.data() as { company_id?: string; role?: string }) : null);
      } catch {
        setProfile(null);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const canSubscribe = Boolean(
    profile?.company_id &&
    (profile?.role === 'manager' || profile?.role === 'admin')
  );

  const handleSubscribe = async (tier: TierId) => {
    if (!profile?.company_id || !authUser) return;
    setCheckoutError(null);
    setPromoCodeError(null);
    setCheckoutLoading(tier);
    try {
      const token = await authUser.getIdToken();
      console.log('[Pricing] Starting checkout:', { tier, company_id: profile.company_id, promoCode: promoCode.trim() || null });
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          tier, 
          company_id: profile.company_id,
          promo_code: promoCode.trim() || undefined,
        }),
        // Add timeout signal
        signal: AbortSignal.timeout(25000), // 25s timeout (less than Vercel's 30s)
      });
      
      // Handle non-JSON responses (like 504 HTML error page)
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('[Pricing] Non-JSON response:', { status: res.status, contentType, text: text.substring(0, 200) });
        throw new Error(`Server error (${res.status}). ${res.status === 504 ? 'Request timed out. Please try again.' : 'Please check server logs.'}`);
      }
      
      const data = await res.json();
      console.log('[Pricing] Checkout response:', { ok: res.ok, status: res.status, data });
      if (!res.ok) {
        const errorMsg = data.error || `Checkout failed (${res.status})`;
        console.error('[Pricing] Checkout API error:', { status: res.status, error: errorMsg, data });
        throw new Error(errorMsg);
      }
      if (data.url) window.location.href = data.url;
      else throw new Error('No checkout URL');
    } catch (e) {
      let message = 'Something went wrong';
      if (e instanceof Error) {
        // Handle AbortError (timeout)
        if (e.name === 'AbortError' || e.message.includes('timeout')) {
          message = 'Request timed out. The server may be slow. Please try again.';
        } else {
          message = e.message;
        }
        console.error('[Pricing] Checkout error:', {
          message: e.message,
          name: e.name,
          stack: e.stack,
        });
      } else {
        console.error('[Pricing] Unknown checkout error:', e);
      }
      setCheckoutError(message);
    } finally {
      setCheckoutLoading(null);
    }
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
      ],
      enterpriseNote: true,
    }
  ];

  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 sm:pt-32 pb-12 sm:pb-20">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto relative px-2 sm:px-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/15 rounded-full blur-2xl"></div>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary/5 rounded-full blur-xl"></div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 relative leading-tight">
            Simple, Transparent <span className="text-primary bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Simple, transparent pricing. Managers can subscribe here with a card. Staff use the app. New users receive a 7-day free trial.
          </p>

          {/* Promo Code Input */}
          {canSubscribe && (
            <div className="max-w-md mx-auto mb-8 sm:mb-12">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoCodeError(null);
                  }}
                  placeholder="Enter promo code"
                  className="flex-1 rounded-lg bg-white/5 border border-white/20 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors uppercase"
                />
              </div>
              {promoCodeError && (
                <p className="text-red-400 text-sm mt-2 text-center">{promoCodeError}</p>
              )}
            </div>
          )}

          {/* Checkout error - announced to screen readers */}
          {checkoutError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-center"
            >
              {checkoutError}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 max-w-8xl mx-auto relative pt-8 overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 blur-3xl rounded-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            {tiers.map((tier, index) => (
              <div
                key={tier.id}
                className={`relative bg-black/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border transition-all duration-500 hover:border-primary/60 hover:scale-[1.02] hover:shadow-2xl flex flex-col group overflow-visible ${
                  index === 2 
                    ? 'border-primary shadow-2xl shadow-primary/20 ring-2 ring-primary/20' 
                    : 'border-primary/30 hover:shadow-xl hover:shadow-primary/10'
                }`}
              >
                {index === 2 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-primary text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">Most Popular</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 text-center">{tier.name}</h3>
                  <p className="text-white/70 mb-6 text-sm sm:text-base text-center leading-relaxed">{tier.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {formatPrice(tier.price)}
                    </span>
                    <div className="text-white/60 text-sm mt-2">per month</div>
                  </div>
                  {canSubscribe ? (
                    <button
                      type="button"
                      onClick={() => handleSubscribe(tier.id)}
                      disabled={checkoutLoading !== null}
                      className={`block w-full py-3 px-6 rounded-xl transition-all duration-300 text-sm font-semibold disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black ${
                        index === 2
                          ? 'bg-primary hover:bg-primary-light text-black shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                          : 'bg-primary/10 hover:bg-primary/20 text-white border border-primary/20 hover:border-primary/40'
                      }`}
                      aria-busy={checkoutLoading === tier.id}
                      aria-label={checkoutLoading === tier.id ? 'Redirecting to checkout' : `Subscribe to ${tier.name}`}
                    >
                      {checkoutLoading === tier.id ? 'Redirecting…' : 'Subscribe'}
                    </button>
                  ) : (
                    <Link
                      href={authLoading ? '#' : (profile ? '/contact' : '/dashboard')}
                      className={`block w-full py-3 px-6 rounded-xl transition-all duration-300 text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black ${
                        index === 2
                          ? 'bg-primary hover:bg-primary-light text-black shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                          : 'bg-primary/10 hover:bg-primary/20 text-white border border-primary/20 hover:border-primary/40'
                      }`}
                      aria-label={authLoading ? 'Loading' : profile ? 'Contact us to subscribe' : 'Log in to subscribe'}
                    >
                      {authLoading ? '…' : profile ? 'Contact' : 'Log in to subscribe'}
                    </Link>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start group-hover:translate-x-1 transition-transform duration-300">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                      <span className="text-white/85 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                  {tier.enterpriseNote && (
                    <p className="text-white/50 text-xs mt-3 pt-2 border-t border-white/10">
                      Very large fleets or user counts? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> for a tailored quote.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>


          {/* Subscription Terms */}
          <div className="mt-12 sm:mt-16 bg-black/60 border border-primary/30 rounded-2xl p-8 text-left backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              Subscription Terms
            </h3>
            <ul className="space-y-3 text-sm sm:text-base text-white/85">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span>All subscriptions are auto-renewable and billed monthly</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span>New users receive a 7-day free trial</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Subscriptions automatically renew unless cancelled 24 hours before period end</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Managers can subscribe or renew here with a card; in-app subscriptions use App Store or Google Play</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Enterprise is available in-app and can be purchased here for your company</span>
              </li>
            </ul>
          </div>

          {/* New user / sign-up */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/60">
              New to Stock Track PRO? <Link href="/how-to" className="text-primary hover:underline">See how to get started</Link> in the app or <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
            </p>
          </div>

          {/* Pricing Notice */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-sm sm:text-base text-white/70 bg-black/40 border border-primary/20 rounded-lg px-6 py-3 inline-block">
              All prices shown include VAT at 20%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 