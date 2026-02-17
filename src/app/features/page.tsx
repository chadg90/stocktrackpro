import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { Car, ClipboardList, QrCode, Users, Wrench, RefreshCw, Shield, ArrowRight } from 'lucide-react';

export default function Features() {
  const featureBlocks = [
    {
      title: "Fleet Management",
      description: "Track vehicles, mileage, inspections, service dates, and defects with full history.",
      icon: Car,
    },
    {
      title: "Asset and Tool Tracking",
      description: "Track tools across sites, projects, and users. QR scanning makes check-in and check-out instant.",
      icon: ClipboardList,
    },
    {
      title: "Vehicle Inspections",
      description: "Structured inspections with required photos, checklist items, and defect flagging.",
      icon: Wrench,
    },
    {
      title: "Defect Workflow",
      description: "Mark a defect to move a vehicle into maintenance. Resolve the defect to return it to active status.",
      icon: Shield,
    },
    {
      title: "QR Code Module",
      description: "Apply QR codes to tools for scanning, check items in or out, and track who had the item last.",
      icon: QrCode,
    },
    {
      title: "Team Roles",
      description: "Manager provides company oversight. Users focus on field work with scoped access.",
      icon: Users,
    },
  ];

  const dashboardHighlights = [
    "At-a-glance metrics for total assets, vehicles, and team members (company scoped).",
    "Manual refresh from the header to pull the latest data.",
    "Quick navigation to team management, add asset, locations, history, vehicle inspections, and access code creation.",
    "Generate a single-use, 7-day access code tied to the manager's company for onboarding.",
    "Defect notification modal shows vehicle, inspector, date, type, severity, and description with options to view the full report or dismiss.",
    "Dashboard is used to view details and export information; subscriptions are managed in the mobile app.",
  ];

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(254,169,23,0.12),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container relative mx-auto px-4">
          <p className="text-primary font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Features
          </p>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              Built for small businesses, trades, and contractors
            </h1>
            <p className="text-lg text-white/75 leading-relaxed">
              Fleet and asset management on iOS, Android, and the web dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16 sm:py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featureBlocks.map((feature) => (
              <div
                key={feature.title}
                className="group p-7 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
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

      {/* Manager Dashboard block */}
      <section className="py-16 sm:py-20 bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto p-8 sm:p-10 rounded-2xl border border-white/10 bg-black/40 hover:border-primary/20 transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">Manager Dashboard</h2>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Managers with an active subscription can view company data across tools, vehicles, users, and reports. Actions focus on reviewing data, exporting, and onboarding; subscriptions remain managed in the mobile app.
                </p>
                <ul className="space-y-3 text-white/80">
                  {dashboardHighlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(254,169,23,0.1),transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to get started?</h3>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            New users receive a 7-day free trial. Subscriptions are managed in the app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-light text-black font-semibold transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02]"
            >
              Contact
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
      </section>
    </div>
  );
}
