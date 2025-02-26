'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  const [showVAT, setShowVAT] = useState(true);
  
  const tiers = [
    {
      name: "Starter",
      users: "1-5 users",
      price: 10.00,
      features: [
        "Real-time tool tracking",
        "QR code scanning",
        "Tool condition monitoring",
        "Location tracking",
        "Mobile app access",
        "Advanced reporting",
        "API access",
        "Priority support",
        "Custom fields",
        "Bulk operations",
        "Data export",
        "Custom integrations",
        "Training sessions",
        "SLA guarantee",
        "Custom workflows"
      ]
    },
    {
      name: "Growth",
      users: "6-20 users",
      price: 8.33,
      features: [
        "Real-time tool tracking",
        "QR code scanning",
        "Tool condition monitoring",
        "Location tracking",
        "Mobile app access",
        "Advanced reporting",
        "API access",
        "Priority support",
        "Custom fields",
        "Bulk operations",
        "Data export",
        "Custom integrations",
        "Training sessions",
        "SLA guarantee",
        "Custom workflows"
      ]
    },
    {
      name: "Scale",
      users: "21-50 users",
      price: 6.67,
      features: [
        "Real-time tool tracking",
        "QR code scanning",
        "Tool condition monitoring",
        "Location tracking",
        "Mobile app access",
        "Advanced reporting",
        "API access",
        "Priority support",
        "Custom fields",
        "Bulk operations",
        "Data export",
        "Custom integrations",
        "Training sessions",
        "SLA guarantee",
        "Custom workflows"
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
            All plans include every feature. Simply choose the plan that matches your team size.
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
                  <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base">{tier.users}</p>
                  <div className="mb-6 sm:mb-8">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {formatPrice(calculatePrice(tier.price))}
                    </span>
                    <div className="text-white/60 text-xs sm:text-sm mt-1">per user, per month</div>
                  </div>
                  <Link
                    href="/contact"
                    className={`block w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors ${
                      index === 1
                        ? 'bg-primary hover:bg-primary-light text-white'
                        : 'bg-primary/10 hover:bg-primary/20 text-white'
                    }`}
                  >
                    Get Started
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

          {/* VAT Notice */}
          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-white/60">
            {showVAT ? 'All prices shown include VAT at 20%' : 'All prices shown exclude VAT at 20%'}
          </p>
        </div>
      </div>
    </div>
  );
} 