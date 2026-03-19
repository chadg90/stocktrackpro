'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

const PRICE_PER_VEHICLE = 8;
const MIN_VEHICLES = 5;
const MAX_VEHICLES = 100;

type Tier = { label: string; assets: string; users: string };
function getTier(count: number): Tier {
  if (count <= 15) return { label: 'Starter',    assets: '1,000 assets',    users: 'Up to 15 users'    };
  if (count <= 35) return { label: 'Growth',     assets: '5,000 assets',    users: 'Up to 35 users'    };
  if (count <= 75) return { label: 'Business',   assets: '20,000 assets',   users: 'Up to 75 users'    };
  return               { label: 'Enterprise', assets: 'Unlimited assets', users: 'Unlimited users'   };
}

export default function PricingSection() {
  const [vehicleCount, setVehicleCount] = useState(MIN_VEHICLES);
  const monthlyTotal = vehicleCount * PRICE_PER_VEHICLE;
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
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-lg text-gray-600">
            £{PRICE_PER_VEHICLE} per vehicle per month. All features included. No tiers.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 px-8 py-6 text-center">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              {tier.label}
            </span>
            <div className="flex items-end justify-center gap-1">
              <span className="text-5xl font-bold text-white">£{monthlyTotal}</span>
              <span className="text-blue-200 text-lg mb-1">/month</span>
            </div>
            <p className="text-blue-200 text-sm mt-1">
              £{PRICE_PER_VEHICLE} &times; {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}
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
              Get Started — £{monthlyTotal}/month
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
