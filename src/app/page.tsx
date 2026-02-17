import React from 'react';
import type { Metadata } from 'next';
import Navbar from './components/Navbar';
import { Wrench, QrCode, Map, Smartphone, Users, ClipboardList, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Fleet & Asset Management for Trades and Contractors',
  description: 'Track tools, equipment, and vehicles in one app. Inspections, defects, QR check-ins, and team management for small businesses and contractors. UK.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Fleet & Asset Management for Trades and Contractors | Stock Track PRO',
    description: 'Track tools, equipment, and vehicles in one app. Inspections, defects, QR check-ins, and team management.',
    url: 'https://stocktrackpro.com',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet & Asset Management for Trades and Contractors | Stock Track PRO',
    description: 'Track tools, equipment, and vehicles in one app. Inspections, defects, QR check-ins, and team management.',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
              Fleet and Asset Management for Small Businesses, Trades and Contractors
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
              Track tools, equipment, and vehicles in one simple app. Inspections, defects, QR check-ins, and team management in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-primary hover:bg-primary-light text-black font-semibold transition-colors text-sm sm:text-base"
              >
                Contact
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg border border-primary/40 text-white hover:border-primary hover:bg-primary/10 transition-colors text-sm sm:text-base"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-12 sm:py-16 border-y border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-white/50 text-sm font-medium uppercase tracking-wider mb-6">
            Trusted by
          </p>
          <p className="text-center text-white/80 text-lg max-w-2xl mx-auto">
            Trades and contractors across the UK who want to stop losing tools and keep vehicles compliant.
          </p>
        </div>
      </section>

      {/* Companies which use us (with permission) */}
      <section className="py-12 sm:py-20 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
            Companies which use us
          </h2>
          <p className="text-white/60 text-sm sm:text-base text-center max-w-xl mx-auto mb-10">
            Shown with their permission. If you use Stock Track PRO and are happy to be listed here, get in touch.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 min-h-[120px]">
            {/* Placeholder: add company logos/names here when they allow */}
            <p className="text-white/40 text-sm">
              Your company could be here — contact us if you&apos;d like to be featured.
            </p>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Work Smarter. Stay Organised. Reduce Loss and Downtime.
          </h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            Everything you need to manage fleet and assets in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: <QrCode className="w-6 h-6 text-primary" />, title: "QR Check-In / Check-Out", description: "Instant check-in and check-out with QR scanning across tools, equipment, and vehicles." },
              { icon: <Map className="w-6 h-6 text-primary" />, title: "Fleet Tracking", description: "Monitor vehicles, inspections, mileage, and service dates across every site." },
              { icon: <Smartphone className="w-6 h-6 text-primary" />, title: "Tool and Asset Management", description: "Track tools and equipment across locations, jobs, and users with full history." },
              { icon: <Users className="w-6 h-6 text-primary" />, title: "Team and Role Management", description: "Managers oversee the company and team; staff work in the field." },
              { icon: <Wrench className="w-6 h-6 text-primary" />, title: "Vehicle Inspections", description: "Capture required photos, checklist items, and defects to keep vehicles compliant." },
              { icon: <ClipboardList className="w-6 h-6 text-primary" />, title: "Defect Reporting", description: "Flag defects, mark repairs complete, and update vehicle status instantly." },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 sm:p-8 rounded-2xl border border-primary/20 hover:border-primary/40 bg-black/40 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stock Track PRO */}
      <section className="py-16 sm:py-24 border-t border-white/10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 text-center">
            Why Stock Track PRO
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { title: "Asset Tracking", description: "Track tools, equipment, and machinery across locations, jobs, and users.", icon: <ClipboardList className="w-5 h-5 text-primary" /> },
              { title: "QR Scanning", description: "Instant check-in and check-out using built-in QR scanning for fast workflows.", icon: <QrCode className="w-5 h-5 text-primary" /> },
              { title: "Fleet Management", description: "Log every vehicle, inspection, mileage reading, and service date.", icon: <Map className="w-5 h-5 text-primary" /> },
              { title: "Photo Inspections", description: "Capture required inspection photos and attach defect reports on the spot.", icon: <Smartphone className="w-5 h-5 text-primary" /> },
              { title: "Defect Reporting", description: "Flag defects, mark repairs complete, and automatically update vehicle status.", icon: <Wrench className="w-5 h-5 text-primary" /> },
              { title: "Team Management", description: "Managers control their company; field staff keep work moving.", icon: <Users className="w-5 h-5 text-primary" /> },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 p-5 rounded-xl border border-primary/20 hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform views */}
      <section className="py-16 sm:py-24 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 text-center">
            Platform Views
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Manager Dashboard", description: "At-a-glance metrics for total assets, vehicles, and team members." },
              { title: "Vehicle Inspection", description: "Guided checklist with required photos and defect logging." },
              { title: "QR Scan", description: "Fast scan to check items in or out and record who has them." },
              { title: "Asset List", description: "Filtered views of tools and equipment across locations and projects." },
              { title: "Vehicle Status", description: "Status by vehicle including active, maintenance, and defects." },
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-xl border border-primary/20">
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 border-t border-white/10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 text-center">
            Why Companies Choose Stock Track PRO
          </h2>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Stop losing tools and assets.",
              "Reduce downtime with faster defect reporting.",
              "Keep vehicles safe and compliant.",
              "See team activity in one place.",
              "Get audit trails for insurance and compliance.",
              "Use on iOS, Android, and Web Dashboard.",
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-xl border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-white/90 text-sm sm:text-base">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-primary/5 border-t border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Start Managing Your Fleet and Tools Today
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            New users get a 7-day free trial. All subscriptions are managed through the app. Managers can access the dashboard to review company data.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-primary hover:bg-primary-light text-black font-semibold transition-colors text-sm sm:text-base"
            >
              Contact
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg border border-primary/40 text-white hover:bg-primary/10 transition-colors text-sm sm:text-base"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
