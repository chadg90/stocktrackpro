import React from 'react';
import type { Metadata } from 'next';
import Navbar from './components/Navbar';
import { Wrench, QrCode, Map, Smartphone, Users, ClipboardList, ArrowRight, Check } from 'lucide-react';
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
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar />

      {/* Hero — premium */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 pb-24 sm:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(254,169,23,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(254,169,23,0.08),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container relative mx-auto px-4">
          <p className="text-primary font-medium text-sm uppercase tracking-[0.2em] mb-6">
            Fleet & asset management
          </p>
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              One app for your tools, vehicles and team.
            </h1>
            <p className="text-lg sm:text-xl text-white/75 mb-10 max-w-2xl leading-relaxed">
              Track equipment, run inspections, report defects and manage your fleet in real time. Built for trades and contractors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-light text-black font-semibold transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02]"
              >
                Get in touch
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white hover:border-primary/50 hover:bg-white/5 transition-all duration-200 font-medium"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-14 sm:py-18 border-y border-white/10 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <p className="text-center text-white/40 text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Trusted by
          </p>
          <p className="text-center text-white/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Trades and contractors across the UK who want to stop losing tools and keep vehicles compliant.
          </p>
        </div>
      </section>

      {/* Companies which use us */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
            Companies which use us
          </h2>
          <p className="text-white/50 text-sm text-center max-w-md mx-auto mb-12">
            Shown with their permission. Happy to be listed here? Get in touch.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 min-h-[100px] rounded-2xl border border-dashed border-white/20 bg-white/[0.02] py-8 px-6">
            <p className="text-white/35 text-sm">
              Your company could be here — contact us to be featured.
            </p>
          </div>
        </div>
      </section>

      {/* Features grid — cards with hover */}
      <section className="py-20 sm:py-28 border-t border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-primary font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center max-w-2xl mx-auto">
            Work smarter. Stay organised. Reduce loss and downtime.
          </h2>
          <p className="text-white/55 text-center max-w-xl mx-auto mb-16">
            Everything you need to manage fleet and assets in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: QrCode, title: "QR check-in / check-out", description: "Instant check-in and check-out with QR scanning across tools, equipment, and vehicles." },
              { icon: Map, title: "Fleet tracking", description: "Monitor vehicles, inspections, mileage, and service dates across every site." },
              { icon: Smartphone, title: "Tool & asset management", description: "Track tools and equipment across locations, jobs, and users with full history." },
              { icon: Users, title: "Team & roles", description: "Managers oversee the company and team; staff work in the field." },
              { icon: Wrench, title: "Vehicle inspections", description: "Capture required photos, checklist items, and defects to keep vehicles compliant." },
              { icon: ClipboardList, title: "Defect reporting", description: "Flag defects, mark repairs complete, and update vehicle status instantly." },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-7 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 text-primary group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stock Track PRO */}
      <section className="py-20 sm:py-28 bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-primary font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Why us
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-14 text-center">
            Why Stock Track PRO
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { title: "Asset tracking", description: "Track tools, equipment, and machinery across locations, jobs, and users.", icon: ClipboardList },
              { title: "QR scanning", description: "Instant check-in and check-out using built-in QR scanning for fast workflows.", icon: QrCode },
              { title: "Fleet management", description: "Log every vehicle, inspection, mileage reading, and service date.", icon: Map },
              { title: "Photo inspections", description: "Capture required inspection photos and attach defect reports on the spot.", icon: Smartphone },
              { title: "Defect reporting", description: "Flag defects, mark repairs complete, and automatically update vehicle status.", icon: Wrench },
              { title: "Team management", description: "Managers control their company; field staff keep work moving.", icon: Users },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 p-5 rounded-xl border border-white/10 bg-black/40 hover:border-primary/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform views */}
      <section className="py-20 sm:py-28 border-t border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-primary font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Product
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-14 text-center">
            Platform views
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Manager dashboard", description: "At-a-glance metrics for total assets, vehicles, and team members." },
              { title: "Vehicle inspection", description: "Guided checklist with required photos and defect logging." },
              { title: "QR scan", description: "Fast scan to check items in or out and record who has them." },
              { title: "Asset list", description: "Filtered views of tools and equipment across locations and projects." },
              { title: "Vehicle status", description: "Status by vehicle including active, maintenance, and defects." },
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 sm:py-28 bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-primary font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Outcomes
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-14 text-center">
            Why companies choose Stock Track PRO
          </h2>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Stop losing tools and assets.",
              "Reduce downtime with faster defect reporting.",
              "Keep vehicles safe and compliant.",
              "See team activity in one place.",
              "Get audit trails for insurance and compliance.",
              "Use on iOS, Android, and web dashboard.",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-black/40 hover:border-primary/20 transition-colors">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-white/90 text-sm sm:text-base">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — strong close */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(254,169,23,0.12),transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 max-w-3xl mx-auto leading-tight">
            Start managing your fleet and tools today
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-4 text-lg">
            New users get a 7-day free trial. Subscriptions are managed through the app; managers use the dashboard to review company data.
          </p>
          <p className="text-white/50 text-sm mb-10">
            New company? <Link href="/onboarding" className="text-primary hover:underline">Create your account and set up in minutes</Link>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary hover:bg-primary-light text-black font-semibold transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02]"
            >
              Get started
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white hover:border-primary/50 hover:bg-white/5 transition-all duration-200 font-medium"
            >
              Contact
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white hover:border-primary/50 hover:bg-white/5 transition-all duration-200 font-medium"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
