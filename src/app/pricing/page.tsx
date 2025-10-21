'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
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
        "Asset condition monitoring",
        "Location tracking",
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
        "Basic reporting",
        "Mobile app access",
        "Asset condition monitoring",
        "Location tracking",
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
        "Basic reporting",
        "Mobile app access",
        "Asset condition monitoring",
        "Location tracking",
        "7-day free trial"
      ]
    },
    {
      name: "Professional Enterprise",
      description: "For large enterprises",
      price: 119.99,
      features: [
        "Unlimited asset tracking",
        "Unlimited vehicle tracking",
        "Unlimited team members",
        "QR code scanning",
        "Vehicle inspections",
        "Basic reporting",
        "Mobile app access",
        "Asset condition monitoring",
        "Location tracking",
        "7-day free trial"
      ]
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
          <p className="text-xl sm:text-2xl text-white/90 mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed">
            All plans include a 7-day free trial. Choose the plan that fits your needs.
          </p>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 sm:gap-10 max-w-8xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 blur-3xl rounded-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative bg-black/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-10 border transition-all duration-500 hover:border-primary/60 hover:scale-[1.02] hover:shadow-2xl flex flex-col group ${
                  index === 2 
                    ? 'border-primary shadow-2xl shadow-primary/20 ring-2 ring-primary/20' 
                    : 'border-primary/30 hover:shadow-xl hover:shadow-primary/10'
                }`}
              >
                <div className="text-center mb-8">
                  {index === 2 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-black px-4 py-1 rounded-full text-sm font-bold">Most Popular</span>
                    </div>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 text-center">{tier.name}</h3>
                  <p className="text-white/70 mb-6 text-sm sm:text-base text-center leading-relaxed">{tier.description}</p>
                  <div className="mb-8">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {formatPrice(tier.price)}
                    </span>
                    <div className="text-white/60 text-sm mt-2">per month</div>
                  </div>
                  <Link
                    href="/contact"
                    className={`block w-full py-3 px-6 rounded-xl transition-all duration-300 text-sm font-semibold ${
                      index === 2
                        ? 'bg-primary hover:bg-primary-light text-black shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                        : 'bg-primary/10 hover:bg-primary/20 text-white border border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                </div>
                <div className="flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start group-hover:translate-x-1 transition-transform duration-300">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                      <span className="text-white/85 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Section */}
          <div className="mt-16 sm:mt-24 bg-gradient-to-br from-black/90 to-black/70 border border-primary/30 rounded-2xl sm:rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-primary/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Enterprise Solutions</h2>
              <p className="text-white/90 mb-8 text-base sm:text-lg leading-relaxed max-w-2xl">
                Need more than 40 users or unlimited vehicles? Contact us for custom pricing and features tailored to your enterprise needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-primary-light text-black rounded-xl transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                >
                  Contact Sales
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-primary/30 hover:border-primary/60 text-white rounded-xl transition-all duration-300 text-base sm:text-lg font-semibold hover:bg-primary/5"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
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
                <span>7-day free trial included with all plans - no charges during trial period</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Subscriptions automatically renew unless cancelled 24 hours before period end</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Manage subscriptions through your App Store account settings</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Unused trial time is forfeited when purchasing a subscription</span>
              </li>
            </ul>
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