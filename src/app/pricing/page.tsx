'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';

const PRICE_PER_VEHICLE = 8;
const MIN_VEHICLES = 5;
const MAX_VEHICLES = 100;

type Tier = { label: string; assets: string; users: string; colour: string };

function getTier(count: number): Tier {
  if (count <= 15) return { label: 'Starter',    assets: '1,000 assets',   users: 'Up to 15 users',     colour: 'text-sky-400'    };
  if (count <= 35) return { label: 'Growth',     assets: '5,000 assets',   users: 'Up to 35 users',     colour: 'text-indigo-400' };
  if (count <= 75) return { label: 'Business',   assets: '20,000 assets',  users: 'Up to 75 users',     colour: 'text-violet-400' };
  return               { label: 'Enterprise', assets: 'Unlimited assets', users: 'Unlimited users',    colour: 'text-blue-400'   };
}

export default function Pricing() {
  const [profile, setProfile] = useState<{ company_id?: string; role?: string } | null>(null);
  const [authUser, setAuthUser] = useState<{ getIdToken: () => Promise<string> } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [vehicleCount, setVehicleCount] = useState(MIN_VEHICLES);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) { setAuthLoading(false); return; }
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) {
        setProfile(null); setAuthUser(null); setAuthLoading(false); return;
      }
      setAuthUser(user);
      try {
        const snap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
        setProfile(snap.exists() ? (snap.data() as { company_id?: string; role?: string }) : null);
      } catch { setProfile(null); }
      finally { setAuthLoading(false); }
    });
    return () => unsub();
  }, []);

  const canSubscribe = Boolean(
    profile?.company_id && (profile?.role === 'manager' || profile?.role === 'admin')
  );

  const monthlyTotal = vehicleCount * PRICE_PER_VEHICLE;

  const handleSubscribe = async () => {
    if (!profile?.company_id || !authUser) return;
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const token = await authUser.getIdToken();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vehicle_count: vehicleCount, company_id: profile.company_id }),
        signal: AbortSignal.timeout(25000),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Server error (${res.status}). ${res.status === 504 ? 'Request timed out.' : 'Please try again.'}`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Checkout failed (${res.status})`);
      if (data.url) window.location.href = data.url;
      else throw new Error('No checkout URL');
    } catch (e) {
      let message = 'Something went wrong';
      if (e instanceof Error) {
        message = e.name === 'AbortError' ? 'Request timed out. Please try again.' : e.message;
      }
      setCheckoutError(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const tier = getTier(vehicleCount);

  const features = [
    tier.assets,
    tier.users,
    'Unlimited vehicle inspections',
    'Defect reporting & workflow',
    'MOT & Tax expiry reminders',
    'Full company dashboard',
    'Team management & invite system',
    'QR code scanning',
    'Asset & tool tracking',
    'Mobile app for iOS & Android',
    'Priority email support',
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="container mx-auto px-4 pt-20 sm:pt-32 pb-12 sm:pb-20">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 px-2">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight relative">
            Simple, Transparent{' '}
            <span className="text-blue-500 bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/75 leading-relaxed">
            Pay per vehicle. No tiers, no hidden fees. Scale up or down — changes take effect from your next billing cycle.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Pricing Card */}
          <div className="relative bg-black/80 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-blue-500 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                One plan — all features included
              </span>
            </div>

            {/* Price display */}
            <div className="text-center mb-8 mt-2">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${tier.colour} border-current bg-current/10 transition-all duration-300`}>
                  {tier.label}
                </span>
              </div>
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-5xl sm:text-6xl font-bold text-white transition-all duration-200">
                  £{monthlyTotal.toFixed(0)}
                </span>
                <span className="text-white/50 text-lg mb-2">/month</span>
              </div>
              <p className="text-white/50 text-sm">
                £{PRICE_PER_VEHICLE} per vehicle &times; {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Slider */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-white/60 mb-3">
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
              {vehicleCount >= MAX_VEHICLES && (
                <p className="text-center text-sm text-blue-400 mt-2">
                  Need more than {MAX_VEHICLES} vehicles?{' '}
                  <Link href="/contact" className="underline hover:text-blue-300">Contact us</Link> for a custom quote.
                </p>
              )}
            </div>

            {/* Tier steps */}
            <div className="grid grid-cols-4 gap-1 mb-6">
              {(['Starter','Growth','Business','Enterprise'] as const).map((t) => (
                <div key={t} className={`rounded-lg py-1.5 px-1 text-center text-xs font-medium transition-all duration-300 ${tier.label === t ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-white/5 text-white/30 border border-white/10'}`}>
                  {t}
                </div>
              ))}
            </div>

            {/* CTA */}
            {checkoutError && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm text-center">
                {checkoutError}
              </div>
            )}

            {canSubscribe ? (
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={checkoutLoading}
                className="w-full py-4 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
                aria-busy={checkoutLoading}
              >
                {checkoutLoading ? 'Redirecting to checkout…' : `Subscribe — £${monthlyTotal}/month`}
              </button>
            ) : (
              <Link
                href={authLoading ? '#' : (profile ? '/contact' : '/dashboard')}
                className="block w-full py-4 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base text-center shadow-lg shadow-blue-500/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                {authLoading ? '…' : profile ? 'Contact us' : 'Log in to subscribe'}
              </Link>
            )}

            <p className="text-center text-white/40 text-xs mt-3">
              New companies receive a 7-day free trial &bull; Cancel anytime
            </p>

            {/* Features */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-white/60 text-sm font-medium mb-4">Everything included:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-white/75 text-sm leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Subscription Terms */}
          <div className="mt-8 bg-black/60 border border-blue-500/30 rounded-2xl p-6 text-left backdrop-blur-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Subscription Terms
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" /><span>Billed monthly — £{PRICE_PER_VEHICLE} per vehicle</span></li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" /><span>Minimum {MIN_VEHICLES} vehicles (£{MIN_VEHICLES * PRICE_PER_VEHICLE}/month)</span></li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" /><span>Vehicle count changes take effect from your next billing cycle</span></li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" /><span>New companies receive a 7-day free trial</span></li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" /><span>Cancel anytime — no long-term contracts</span></li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" /><span>All prices include VAT at 20%</span></li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/50">
              New to Stock Track PRO?{' '}
              <Link href="/how-to" className="text-blue-500 hover:underline">See how to get started</Link>
              {' '}or{' '}
              <Link href="/contact" className="text-blue-500 hover:underline">contact us</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
