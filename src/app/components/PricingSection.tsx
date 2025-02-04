'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  
  const tiers = [
    {
      name: "Starter",
      users: "1-5 users",
      priceMonthly: 12,
      priceAnnual: 10,
      features: [
        "Unlimited tools tracking",
        "Basic reporting",
        "User management",
        "Email support",
        "Mobile app access"
      ]
    },
    {
      name: "Growth",
      users: "6-20 users",
      priceMonthly: 10,
      priceAnnual: 8,
      features: [
        "Everything in Starter",
        "Advanced reporting",
        "API access",
        "Priority support",
        "Custom fields"
      ]
    },
    {
      name: "Scale",
      users: "21-50 users",
      priceMonthly: 8,
      priceAnnual: 6,
      features: [
        "Everything in Growth",
        "Custom integrations",
        "Dedicated account manager",
        "Training sessions",
        "SLA guarantee"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the perfect plan for your team
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="relative flex items-center">
            <span className={`mr-3 text-sm ${!isAnnual ? 'font-semibold' : ''}`}>
              Monthly billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 text-sm ${isAnnual ? 'font-semibold' : ''}`}>
              Annual billing (save up to 25%)
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-lg bg-white shadow-lg divide-y divide-gray-200"
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{tier.users}</p>
                <p className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    £{isAnnual ? tier.priceAnnual : tier.priceMonthly}
                  </span>
                  <span className="text-base font-medium text-gray-500">/user/month</span>
                </p>
                {isAnnual && (
                  <p className="mt-1 text-sm text-green-600">
                    Billed annually
                  </p>
                )}
                <button className="mt-8 w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition-colors">
                  Get started
                </button>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Call-out */}
        <div className="mt-12 text-center bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
          <p className="mt-4 text-lg text-gray-600">
            Need more than 50 users? Contact us for custom pricing and features.
          </p>
          <button className="mt-6 inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
            Contact Sales
          </button>
        </div>

        {/* VAT Notice */}
        <p className="mt-8 text-center text-sm text-gray-500">
          All prices exclude VAT where applicable
        </p>
      </div>
    </section>
  );
}
