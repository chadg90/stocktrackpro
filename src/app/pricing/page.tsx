'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  const [showVAT, setShowVAT] = useState(true);
  
  const tiers = [
    {
      name: "Basic",
      description: "Perfect for individual users",
      price: 7.99,
      features: [
        "Track up to 50 tools",
        "1 user account",
        "QR code scanning",
        "Basic reporting",
        "Mobile app access",
        "Tool condition monitoring",
        "Location tracking",
        "7-day free trial"
      ]
    },
    {
      name: "Team",
      description: "Ideal for small teams",
      price: 19.99,
      features: [
        "Track up to 500 tools",
        "Up to 10 team members",
        "QR code scanning",
        "Advanced reporting",
        "Mobile app access",
        "Tool condition monitoring",
        "Location tracking",
        "Team collaboration",
        "7-day free trial"
      ]
    },
    {
      name: "Business",
      description: "For growing businesses",
      price: 39.99,
      features: [
        "Unlimited tools tracking",
        "Up to 50 team members",
        "QR code scanning",
        "Advanced reporting",
        "Mobile app access",
        "Tool condition monitoring",
        "Location tracking",
        "Team collaboration",
        "Priority support",
        "7-day free trial"
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
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 sm:pt-32 pb-12 sm:pb-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto relative px-2 sm:px-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6 relative">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 sm:mb-12">
            All plans include a 7-day free trial. Choose the plan that fits your needs.
          </p>

          {/* VAT Toggle */}
          <div className="flex items-center justify-center mb-8 sm:mb-16">
            <span className={`mr-3 text-xs sm:text-sm ${!showVAT ? 'text-white' : 'text-white/60'}`}>
              Prices ex. VAT
            </span>
            <button
              onClick={() => setShowVAT(!showVAT)}
              className="relative inline-flex h-5 sm:h-6 w-10 sm:w-11 items-center rounded-full transition-colors focus:outline-none"
              style={{ backgroundColor: showVAT ? '#fea917' : '#4B5563' }}
            >
              <span
                className={`inline-block h-3.5 sm:h-4 w-3.5 sm:w-4 transform rounded-full bg-white transition-transform ${
                  showVAT ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 text-xs sm:text-sm ${showVAT ? 'text-white' : 'text-white/60'}`}>
              Prices inc. VAT
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto relative">
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-3xl"></div>
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative bg-black rounded-xl sm:rounded-2xl p-6 sm:p-8 border transition-all duration-300 hover:border-primary/50 hover:scale-105 ${
                  index === 1 
                    ? 'border-primary shadow-xl shadow-primary/10' 
                    : 'border-primary/20'
                }`}
              >
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base">{tier.description}</p>
                  <div className="mb-6 sm:mb-8">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {formatPrice(calculatePrice(tier.price))}
                    </span>
                    <div className="text-white/60 text-xs sm:text-sm mt-1">per month</div>
                  </div>
                  <Link
                    href="/contact"
                    className={`block w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors ${
                      index === 1
                        ? 'bg-primary hover:bg-primary-light text-white'
                        : 'bg-primary/10 hover:bg-primary/20 text-white'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                </div>
                <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 max-h-[300px] overflow-y-auto">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start">
                      <Check className="h-4 sm:h-5 w-4 sm:w-5 text-primary shrink-0 mt-0.5" />
                      <span className="ml-3 text-white/80 text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Section */}
          <div className="mt-12 sm:mt-20 bg-black border border-primary/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Enterprise</h2>
              <p className="text-white/80 mb-6 text-sm sm:text-base">
                Need more than 50 users? Contact us for custom pricing and features.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  Contact Sales
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-primary/20 hover:border-primary/50 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Subscription Terms */}
          <div className="mt-8 sm:mt-12 bg-black border border-primary/20 rounded-xl p-6 text-left">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription Terms</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>• All subscriptions are auto-renewable and billed monthly</li>
              <li>• 7-day free trial included with all plans - no charges during trial period</li>
              <li>• Subscriptions automatically renew unless cancelled 24 hours before period end</li>
              <li>• Manage subscriptions through your App Store account settings</li>
              <li>• Unused trial time is forfeited when purchasing a subscription</li>
            </ul>
          </div>

          {/* VAT Notice */}
          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-white/60">
            {showVAT ? 'All prices shown include VAT at 20%' : 'All prices shown exclude VAT at 20%'}
          </p>
        </div>
      </div>
    </div>
  );
} 