'use client';

import React, { useState } from 'react';
import { Check, HardHat } from 'lucide-react';
import Link from 'next/link';
import {
  MIN_PLANT_MACHINES,
  MAX_PLANT_MACHINES,
  PRICE_PER_MACHINE_MONTHLY_GBP,
  PRICE_PER_MACHINE_YEARLY_GBP,
} from '@/lib/plant/constants';

type BillingCycle = 'monthly' | 'yearly';

const PLANT_FEATURES = [
  'LOLER, service, hire check & PUWER in one inspection entry',
  'Separate PDF per form type',
  '2-year LOLER-compliant record storage',
  'Mobile app for fitters in the field',
  'Manager web dashboard',
];

type PlantPricingCardProps = {
  /** When true and companyId + getIdToken are set, runs Stripe plant checkout */
  showCheckout?: boolean;
  canSubscribe?: boolean;
  companyId?: string;
  getIdToken?: () => Promise<string>;
  onSubscribe?: () => void;
  checkoutLoading?: boolean;
  checkoutError?: string | null;
};

export default function PlantPricingCard({
  showCheckout = false,
  canSubscribe = false,
  companyId,
  getIdToken,
  onSubscribe,
  checkoutLoading: checkoutLoadingProp = false,
  checkoutError: checkoutErrorProp = null,
}: PlantPricingCardProps) {
  const [machineCount, setMachineCount] = useState(MIN_PLANT_MACHINES);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const loading = checkoutLoading || checkoutLoadingProp;
  const error = checkoutErrorProp ?? checkoutError;

  const handlePlantCheckout = async () => {
    if (onSubscribe) {
      onSubscribe();
      return;
    }
    if (!companyId || !getIdToken) return;
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/billing/plant-module/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          machine_count: machineCount,
          company_id: companyId,
          billing_cycle: billingCycle,
        }),
        signal: AbortSignal.timeout(25000),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Server error (${res.status}). Please try again.`);
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `Checkout failed (${res.status})`);
      }
      if (data.url) window.location.href = data.url;
      else throw new Error('No checkout URL');
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const canCheckout =
    showCheckout && canSubscribe && (Boolean(onSubscribe) || (Boolean(companyId) && Boolean(getIdToken)));

  const billedTotal =
    machineCount *
    (billingCycle === 'yearly' ? PRICE_PER_MACHINE_YEARLY_GBP : PRICE_PER_MACHINE_MONTHLY_GBP);
  const monthlyEquivalent =
    billingCycle === 'yearly'
      ? (machineCount * PRICE_PER_MACHINE_YEARLY_GBP) / 12
      : billedTotal;
  const monthlyAtMonthly = machineCount * PRICE_PER_MACHINE_MONTHLY_GBP;
  const yearlySavings = Math.max(0, monthlyAtMonthly * 12 - machineCount * PRICE_PER_MACHINE_YEARLY_GBP);

  const sliderPct =
    ((machineCount - MIN_PLANT_MACHINES) / (MAX_PLANT_MACHINES - MIN_PLANT_MACHINES)) * 100;

  return (
    <div className="relative bg-black/80 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-amber-500/50 shadow-2xl shadow-amber-500/15 ring-2 ring-amber-500/20">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className="bg-amber-500 text-black px-5 py-1.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap inline-flex items-center gap-1.5">
          <HardHat className="h-4 w-4" aria-hidden />
          Plant &amp; Machinery
        </span>
      </div>

      <div className="mt-4 mb-6 flex justify-center">
        <div
          role="tablist"
          aria-label="Plant billing cycle"
          className="inline-flex items-center rounded-full bg-white/5 p-1 border border-white/10"
        >
          <button
            type="button"
            role="tab"
            aria-selected={billingCycle === 'monthly'}
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
              billingCycle === 'monthly' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white/85'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={billingCycle === 'yearly'}
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all inline-flex items-center gap-1.5 ${
              billingCycle === 'yearly' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white/85'
            }`}
          >
            Annual
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                billingCycle === 'yearly' ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              Save 17%
            </span>
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-end justify-center gap-1 mb-1">
          <span className="text-5xl sm:text-6xl font-bold text-white">£{billedTotal}</span>
          <span className="text-white/50 text-lg mb-2">
            {billingCycle === 'yearly' ? '/year' : '/month'}
          </span>
        </div>
        <p className="text-white/50 text-sm">
          {billingCycle === 'yearly' ? (
            <>
              £{PRICE_PER_MACHINE_YEARLY_GBP} per machine &times; {machineCount} machine
              {machineCount !== 1 ? 's' : ''}
              <span className="text-emerald-300/90">
                {' '}
                · £{monthlyEquivalent.toFixed(2)}/month equivalent
              </span>
            </>
          ) : (
            <>
              £{PRICE_PER_MACHINE_MONTHLY_GBP} per machine &times; {machineCount} machine
              {machineCount !== 1 ? 's' : ''}
            </>
          )}
        </p>
        {billingCycle === 'yearly' && yearlySavings > 0 && (
          <p className="text-emerald-300/85 text-xs mt-1">
            You save £{yearlySavings.toFixed(0)} per year vs monthly billing.
          </p>
        )}
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-white/60 mb-3">
          <span>Machines</span>
          <span className="text-white font-semibold">{machineCount}</span>
        </div>
        <input
          type="range"
          min={MIN_PLANT_MACHINES}
          max={MAX_PLANT_MACHINES}
          step={1}
          value={machineCount}
          onChange={(e) => setMachineCount(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${sliderPct}%, rgba(255,255,255,0.1) ${sliderPct}%, rgba(255,255,255,0.1) 100%)`,
          }}
          aria-label="Number of machines"
        />
        <div className="flex justify-between text-xs text-white/30 mt-2">
          <span>{MIN_PLANT_MACHINES} min</span>
          <span>{MAX_PLANT_MACHINES}+</span>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center mb-3" role="alert">
          {error}
        </p>
      )}

      {canCheckout ? (
        <button
          type="button"
          onClick={handlePlantCheckout}
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-base shadow-lg transition-all disabled:opacity-60"
        >
          {loading
            ? 'Redirecting…'
            : `Subscribe Plant — £${billedTotal}${billingCycle === 'yearly' ? '/year' : '/month'}`}
        </button>
      ) : showCheckout && !canSubscribe ? (
        <Link
          href="/login"
          className="block w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-base text-center shadow-lg transition-all"
        >
          Log in as manager to subscribe
        </Link>
      ) : (
        <Link
          href="/pricing"
          className="block w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-base text-center shadow-lg transition-all"
        >
          View Plant pricing
        </Link>
      )}

      <p className="text-center text-white/40 text-xs mt-3">
        Minimum {MIN_PLANT_MACHINES} machines · Billed via Stripe · Assign inspector seats in Team after
        activation
      </p>

      <div className="mt-8 pt-8 border-t border-white/10">
        <p className="text-white/60 text-sm font-medium mb-4">Included:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
          {PLANT_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-white/75 text-sm leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
