'use client';

import React, { useState } from 'react';
import { Check, ShieldCheck, Wrench } from 'lucide-react';
import Link from 'next/link';

const PRICE_PER_VEHICLE_MONTHLY = 8;
const PRICE_PER_VEHICLE_YEARLY = 84;
const MIN_VEHICLES = 5;
const MAX_VEHICLES = 100;

type BillingCycle = 'monthly' | 'yearly';
type Tier = { label: string; assets: string; users: string };
function getTier(count: number): Tier {
  if (count <= 15) return { label: 'Starter',    assets: '1,000 assets',    users: 'Up to 15 users'    };
  if (count <= 35) return { label: 'Growth',     assets: '5,000 assets',    users: 'Up to 35 users'    };
  if (count <= 75) return { label: 'Business',   assets: '20,000 assets',   users: 'Up to 75 users'    };
  return               { label: 'Enterprise', assets: 'Unlimited assets', users: 'Unlimited users'   };
}

export default function PricingSection() {
  const [vehicleCount, setVehicleCount] = useState(MIN_VEHICLES);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const unitPrice = billingCycle === 'yearly' ? PRICE_PER_VEHICLE_YEARLY : PRICE_PER_VEHICLE_MONTHLY;
  const billedTotal = vehicleCount * unitPrice;
  const monthlyEquivalent =
    billingCycle === 'yearly' ? (vehicleCount * PRICE_PER_VEHICLE_YEARLY) / 12 : billedTotal;
  const tier = getTier(vehicleCount);

  const features = [
    tier.assets,
    tier.users,
    'Unlimited vehicle inspections',
    'Defect reporting & workflow',
    'MOT & Tax expiry reminders',
    'Full company dashboard',
    'Team management & invites',
    'QR code scanning',
    'Asset & tool tracking',
    'iOS & Android mobile app',
    'Priority email support',
  ];

  return (
    <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-lg text-gray-600">
            Pay per vehicle. All features included. No tiers, no hidden fees.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden />
              No contract, cancel anytime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wrench className="h-4 w-4 text-emerald-600" aria-hidden />
              Asset &amp; tool tracking included
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 px-8 pt-6 pb-5 text-center">
            <div className="mb-4 flex justify-center">
              <div
                role="tablist"
                aria-label="Billing cycle"
                className="inline-flex items-center rounded-full bg-white/15 p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={billingCycle === 'monthly'}
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition ${
                    billingCycle === 'monthly' ? 'bg-white text-blue-700 shadow' : 'text-white/85 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={billingCycle === 'yearly'}
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition inline-flex items-center gap-1.5 ${
                    billingCycle === 'yearly' ? 'bg-white text-blue-700 shadow' : 'text-white/85 hover:text-white'
                  }`}
                >
                  Annual
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                    billingCycle === 'yearly' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-400/25 text-white'
                  }`}>
                    Save 12%
                  </span>
                </button>
              </div>
            </div>
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              {tier.label}
            </span>
            <div className="flex items-end justify-center gap-1">
              <span className="text-5xl font-bold text-white">£{billedTotal}</span>
              <span className="text-blue-200 text-lg mb-1">{billingCycle === 'yearly' ? '/year' : '/month'}</span>
            </div>
            <p className="text-blue-200 text-sm mt-1">
              {billingCycle === 'yearly'
                ? `£${PRICE_PER_VEHICLE_YEARLY} × ${vehicleCount} vehicle${vehicleCount !== 1 ? 's' : ''} · £${monthlyEquivalent.toFixed(2)}/month equivalent`
                : `£${PRICE_PER_VEHICLE_MONTHLY} × ${vehicleCount} vehicle${vehicleCount !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Slider */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Number of vehicles</span>
                <span className="font-semibold text-gray-900">{vehicleCount}</span>
              </div>
              <input
                type="range"
                min={MIN_VEHICLES}
                max={MAX_VEHICLES}
                step={1}
                value={vehicleCount}
                onChange={(e) => setVehicleCount(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-600"
                aria-label="Number of vehicles"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{MIN_VEHICLES} min</span>
                <span>{MAX_VEHICLES}+</span>
              </div>
            </div>

            <Link
              href="/pricing"
              className="block w-full bg-blue-600 text-white text-center rounded-xl py-3 px-6 font-semibold hover:bg-blue-700 transition-colors mb-6"
            >
              Get Started — £{billedTotal}{billingCycle === 'yearly' ? '/year' : '/month'}
            </Link>

            <ul className="space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Minimum {MIN_VEHICLES} vehicles &bull; 7-day free trial &bull; All prices include VAT &bull; Cancel anytime
        </p>
      </div>
    </section>
  );
}
