'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Pricing() {
  const [showVAT, setShowVAT] = useState(false);
  
  const tiers = [
    {
      name: "Starter",
      users: "1-5 users",
      price: 10.00, // £12 with VAT
      features: [
        "Real-time tool tracking",
        "QR code scanning",
        "Tool condition monitoring",
        "Location tracking",
        "Mobile app access",
        "Full history tracking",
        "Manager controls"
      ]
    },
    {
      name: "Growth",
      users: "6-20 users",
      price: 8.33, // £10 with VAT
      features: [
        "Real-time tool tracking",
        "QR code scanning",
        "Tool condition monitoring",
        "Location tracking",
        "Mobile app access",
        "Full history tracking",
        "Manager controls"
      ]
    },
    {
      name: "Scale",
      users: "21-50 users",
      price: 6.67, // £8 with VAT
      features: [
        "Real-time tool tracking",
        "QR code scanning",
        "Tool condition monitoring",
        "Location tracking",
        "Mobile app access",
        "Full history tracking",
        "Manager controls"
      ]
    }
  ];

  const calculatePrice = (basePrice: number) => {
    return showVAT ? basePrice * 1.20 : basePrice; // 20% VAT
  };

  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto pt-20">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-zinc-300">
              Choose the perfect plan for your team. Book a demo to see how Stock Track PRO can work for your business.
            </p>
          </div>

          {/* VAT Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="relative flex items-center">
              <span className={`mr-3 text-sm text-zinc-300 ${!showVAT ? 'font-semibold' : ''}`}>
                Prices ex. VAT
              </span>
              <button
                onClick={() => setShowVAT(!showVAT)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ${
                  showVAT ? 'bg-zinc-700' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showVAT ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 text-sm text-zinc-300 ${showVAT ? 'font-semibold' : ''}`}>
                Prices inc. VAT
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="bg-zinc-800 p-8 rounded-lg border border-zinc-600 shadow-xl hover:bg-zinc-700/80 transition-colors"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                  <p className="mt-2 text-sm text-zinc-300">{tier.users}</p>
                  <p className="mt-4">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(calculatePrice(tier.price))}
                    </span>
                    <span className="text-base font-medium text-zinc-300">/user/month</span>
                  </p>
                  <button className="mt-8 w-full bg-zinc-700 text-white rounded-lg py-2 px-4 hover:bg-zinc-600 transition-colors border border-zinc-600">
                    Contact Sales
                  </button>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-zinc-300 shrink-0" />
                        <span className="ml-3 text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Call-out */}
          <div className="mt-12 text-center bg-zinc-800 rounded-lg shadow-xl p-8 border border-zinc-600">
            <h3 className="text-2xl font-bold text-white">Enterprise</h3>
            <p className="mt-4 text-lg text-zinc-300">
              Need more than 50 users? Contact us for custom pricing and features.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 border border-zinc-600 text-white rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors">
                Contact Sales
              </button>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-zinc-600 text-white rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors"
              >
                Book a Demo
              </Link>
            </div>
          </div>

          {/* VAT Notice */}
          <p className="mt-8 text-center text-sm text-zinc-400">
            {showVAT ? 'All prices shown include VAT at 20%' : 'All prices shown exclude VAT at 20%'}
          </p>
        </div>
      </div>
    </div>
  );
} 