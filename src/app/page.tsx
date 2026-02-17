import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Navbar from './components/Navbar';
import { Wrench, QrCode, Map, Smartphone, Users, ClipboardList, ArrowRight, Check, Zap, Droplets, Truck } from 'lucide-react';
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
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black btn-brand-blue"
            >
              Get in touch
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
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

      {/* Trusted by */}
      <section className="py-14 sm:py-18 border-y border-white/10 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <p className="text-center text-white/40 text-xs font-semibold uppercase tracking-[0.25em] mb-6">
            Trusted by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-6">
            {[
              { icon: Zap, label: 'Electrical' },
              { icon: Droplets, label: 'Plumbing' },
              { icon: Truck, label: 'Logistics' },
              { icon: Wrench, label: 'Trades' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-white/50">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} aria-hidden />
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-white/70 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Teams across the UK who want to stop losing tools and keep vehicles compliant.
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
        </div>
      </section>

      {/* Platform views */}
      <section className="py-20 sm:py-28 border-t border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-blue-500 font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Product
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center max-w-2xl mx-auto">
            The screens you’ll use
          </h2>
          <p className="text-white/55 text-center max-w-xl mx-auto mb-14">
            Dashboard, app, and key workflows in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Manager dashboard", description: "Totals for assets, vehicles, and team at a glance." },
              { title: "Vehicle inspection", description: "Checklist, photos, and defect logging." },
              { title: "QR scan", description: "Check items in or out and see who has them." },
              { title: "Asset list", description: "Tools and equipment by location or project." },
              { title: "Vehicle status", description: "Active, in maintenance, or defects." },
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
          <p className="text-center text-blue-500 font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Outcomes
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center max-w-2xl mx-auto">
            Why companies choose us
          </h2>
          <p className="text-white/55 text-center max-w-xl mx-auto mb-14">
            Clear outcomes from day one.
          </p>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Stop losing tools and assets.",
              "Reduce downtime with faster defect reporting.",
              "Keep vehicles safe and compliant.",
              "See team activity in one place.",
              "Get audit trails for insurance and compliance.",
              "Use on iOS, Android, and web dashboard.",
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
            New company? <Link href="/onboarding" className="text-blue-500 hover:underline">Create your account and set up in minutes</Link>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black"
            >
              Get started
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/25 text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              Contact
            </Link>
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
