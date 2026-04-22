import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Navbar from './components/Navbar';
import { CompaniesShowcaseStrip, type ShowcaseLogo } from '@/components/CompaniesShowcaseStrip';
import { Wrench, QrCode, Map, Smartphone, Users, ClipboardList, ArrowRight, Check, Zap, Droplets, Truck } from 'lucide-react';
import Link from 'next/link';
const WHATSAPP_ENQUIRY_URL = 'https://wa.me/447438146343?text=Hi%20Stock%20Track%20PRO%2C%20I%27d%20like%20to%20get%20started%20with%20your%20service.';

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

/** Logos in “Companies which use us” — set `featured: true` for a larger mark in the row. */
const SHOWCASE_LOGOS: ShowcaseLogo[] = [
  {
    src: '/clients/newstreet-groundwork.png',
    alt: 'Newstreet Groundwork Services logo',
    featured: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar />

      {/* Hero — split: 50% content, 50% full-bleed image */}
      <section className="relative overflow-hidden pt-20 sm:pt-28 lg:pt-24 lg:min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative flex flex-col justify-center px-4 sm:px-6 lg:px-10 xl:px-16 py-16 lg:py-24 order-2 lg:order-1">
          <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-5">
            Fleet & asset management
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.08]">
            One app for your tools, vehicles and team.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-loose mb-12">
            Track equipment, run inspections, report defects and manage your fleet in real time. Built for trades and contractors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={WHATSAPP_ENQUIRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black btn-brand-blue"
            >
              Get in touch
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/25 text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              View pricing
            </Link>
          </div>
        </div>
        <div className="relative h-[50vh] min-h-[320px] lg:h-full lg:min-h-[calc(100vh-6rem)] order-1 lg:order-2">
          <Image
            src="/website-image-stp.png"
            alt="Stock Track PRO app on phone in the field — sign in to manage assets and equipment"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-right lg:object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent lg:bg-gradient-to-r from-black/80 via-black/20 to-transparent" aria-hidden />
        </div>
      </section>

      {/* Sectors we serve */}
      <section className="py-12 sm:py-16 border-y border-white/10 bg-white/[0.02]">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-center text-white/45 text-[11px] font-semibold uppercase tracking-[0.22em] mb-5">
            Built for
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 mb-5">
            {[
              { icon: Zap, label: 'Electrical' },
              { icon: Droplets, label: 'Plumbing' },
              { icon: Truck, label: 'Logistics' },
              { icon: Wrench, label: 'Trades' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-white/55">
                <Icon className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={1.5} aria-hidden />
                <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-white/65 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            UK teams who want fewer lost tools and clearer vehicle compliance.
          </p>
        </div>
      </section>

      <CompaniesShowcaseStrip logos={SHOWCASE_LOGOS} className="border-t-0" />

      {/* Features grid — cards with hover */}
      <section className="py-20 sm:py-28 border-t border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-blue-500 font-medium text-sm uppercase tracking-[0.2em] mb-4">
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
                className="group relative p-7 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors font-medium text-sm"
            >
              Explore every feature in detail
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-20 sm:py-28 bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-blue-500 font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Outcomes
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center max-w-2xl mx-auto">
            Fewer lost tools. Safer vehicles. A clearer picture.
          </h2>
          <p className="text-white/55 text-center max-w-xl mx-auto mb-14">
            What our customers get after switching to Stock Track PRO.
          </p>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Stop losing tools with QR-based accountability.",
              "Reduce vehicle downtime through faster defect reporting.",
              "Stay compliant with full inspection audit trails.",
              "See fleet and team activity in one place.",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-black/40 hover:border-blue-500/20 transition-colors">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-white/90 text-sm sm:text-base">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — strong close */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(59,130,246,0.12),transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-blue)]/40 to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 max-w-3xl mx-auto leading-tight">
            Start managing your fleet and tools today
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-4 text-lg">
            New users get a 7-day free trial. Subscriptions are managed through the app; managers use the dashboard to review company data.
          </p>
          <p className="text-white/50 text-sm mb-10">
            New company? <a href={WHATSAPP_ENQUIRY_URL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Message us on WhatsApp</a> and we will help you get set up quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={WHATSAPP_ENQUIRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black"
            >
              Get started
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/25 text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
