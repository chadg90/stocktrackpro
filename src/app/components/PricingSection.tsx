'use client';

import React from 'react';
import { Check } from 'lucide-react';

export default function PricingSection() {
  const tiers = [
    {
      name: "Professional Starter",
      description: "Perfect for individual users",
      price: 19.99,
      features: [
        "Track up to 50 assets",
        "Up to 5 vehicles",
        "1 user account",
        "QR code scanning",
        "Vehicle inspections",
        "Basic reporting",
        "Mobile app access",
        "7-day free trial"
      ]
    },
    {
      name: "Professional Team",
      description: "Ideal for small teams",
      price: 34.99,
      features: [
        "Track up to 500 assets",
        "Up to 15 vehicles",
        "Up to 10 team members",
        "QR code scanning",
        "Vehicle inspections",
        "Advanced reporting",
        "Team collaboration",
        "Mobile app access",
        "7-day free trial"
      ]
    },
    {
      name: "Professional Business",
      description: "For growing businesses",
      price: 49.99,
      features: [
        "Unlimited asset tracking",
        "Up to 40 vehicles",
        "Up to 40 team members",
        "QR code scanning",
        "Vehicle inspections",
        "Advanced reporting",
        "Team collaboration",
        "Priority support",
        "Mobile app access",
        "7-day free trial"
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
            All plans include a 7-day free trial
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-lg bg-white shadow-lg divide-y divide-gray-200 flex flex-col"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">
                    £{tier.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <button className="mt-6 w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition-colors text-sm">
                  Start Free Trial
                </button>
              </div>
              <div className="p-6 flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5 mr-2" />
                      <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Call-out */}
        <div className="mt-12 text-center bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900">Professional Enterprise</h3>
          <p className="mt-4 text-lg text-gray-600">
            Need more than 40 users or unlimited vehicles? Contact us for custom pricing and features.
          </p>
          <button className="mt-6 inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
            Contact Sales
          </button>
        </div>

        {/* Pricing Notice */}
        <p className="mt-8 text-center text-sm text-gray-500">
          All prices include VAT at 20%
        </p>
      </div>
    </section>
  );
}
