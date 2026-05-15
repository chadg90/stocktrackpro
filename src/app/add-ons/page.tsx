import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import {
  HardHat,
  CheckCircle,
  FileText,
  Bell,
  Shield,
  ArrowRight,
  Wrench,
  BookOpen,
  Package,
  AlertTriangle,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plant & Machinery Add-on | LOLER & PUWER Compliance',
  description:
    'Add LOLER 1998 and PUWER 1998 compliance to your Stock Track PRO subscription. Machine register, inspection reports, parts library, and due-date alerts.',
};

const WHATSAPP_URL =
  'https://wa.me/447438146343?text=Hi%20Stock%20Track%20PRO%2C%20I%27d%20like%20to%20find%20out%20about%20the%20Plant%20%26%20Machinery%20add-on.';

const FEATURES = [
  {
    icon: HardHat,
    title: 'Machine Register',
    description:
      'Maintain a central register of all plant and machinery. Assign machines to sites, flag hired equipment, and prohibit unsafe plant from use instantly.',
  },
  {
    icon: FileText,
    title: 'LOLER & PUWER Inspection Reports',
    description:
      'Digital inspection forms for LOLER (Lifting Operations and Lifting Equipment Regulations 1998) and PUWER (Provision and Use of Work Equipment Regulations 1998). PDF certificates auto-generated with reference numbers.',
  },
  {
    icon: Package,
    title: 'Parts Library',
    description:
      'Build a shared parts catalogue for your company. Inspectors can quickly select parts when logging defects. Bulk import via CSV.',
  },
  {
    icon: BookOpen,
    title: 'Hire Check Inspections',
    description:
      'Document the condition of hired plant on arrival and return. Protects your company from unjust hire damage claims.',
  },
  {
    icon: Bell,
    title: 'Compliance Due-Date Alerts',
    description:
      'Automatic email and push notifications when LOLER, PUWER, or service dates are approaching or overdue. Configurable lead times.',
  },
  {
    icon: AlertTriangle,
    title: 'Prohibition Management',
    description:
      'Instantly mark a machine as prohibited from use. Log the reason, notify the team, and clear the prohibition once repaired — with a full audit trail.',
  },
  {
    icon: Shield,
    title: 'Inspector Qualifications',
    description:
      'Record IPAF, PASMA, CPCS, and other qualifications against each team member. Track expiry dates to keep your workforce certified.',
  },
  {
    icon: Wrench,
    title: 'Full Amendment Audit Trail',
    description:
      'Every change to an inspection record is logged with the who, what, when, and why — keeping you defensible in any RIDDOR or HSE investigation.',
  },
];

const REGULATION_ITEMS = [
  { regulation: 'LOLER 1998', scope: 'Lifting equipment: cranes, hoists, forklifts, cherry pickers, slings, shackles' },
  { regulation: 'PUWER 1998', scope: 'Work equipment: compressors, generators, mixers, power tools, access platforms' },
  { regulation: 'PSSR 2000', scope: 'Pressure systems: air compressors, pressure vessels (inspection records)' },
];

export default function AddOnsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium mb-6">
          <HardHat className="h-3.5 w-3.5" />
          Add-on Module
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Plant &amp; Machinery Compliance
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-white/60 mb-8">
          Add LOLER 1998 and PUWER 1998 compliance to your Stock Track PRO subscription.
          Machine register, inspection reports, PDF certificates, and due-date alerts — built for SME plant operators.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium rounded-xl transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Regulation Coverage */}
      <section className="py-12 px-4 border-y border-white/10 bg-white/3">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">Regulations Covered</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {REGULATION_ITEMS.map((r) => (
              <div key={r.regulation} className="bg-black/50 border border-white/10 rounded-xl p-4">
                <p className="font-semibold text-blue-400 text-sm mb-1">{r.regulation}</p>
                <p className="text-xs text-white/50">{r.scope}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Everything you need for plant compliance</h2>
          <p className="text-center text-white/50 mb-12">Fully integrated into the Stock Track PRO dashboard and mobile app your team already uses.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white/3 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why add-on model */}
      <section className="py-16 px-4 bg-white/3 border-y border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Only pay for what you need</h2>
          <p className="text-white/60 mb-8">
            Plant &amp; Machinery compliance is an optional add-on to your existing Stock Track PRO subscription.
            If you manage mixed fleets — vehicles <em>and</em> plant — you can activate it any time from your dashboard.
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-3 items-center">
            {[
              'No long-term contract required',
              'Activate or deactivate any time',
              'Separate from vehicle subscription',
            ].map((p) => (
              <span key={p} className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle className="h-4 w-4 text-blue-400 shrink-0" />
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to add plant compliance?</h2>
        <p className="text-white/60 mb-8">Contact us on WhatsApp and we&apos;ll get the module activated for your company today.</p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-colors"
        >
          Get Started on WhatsApp
          <ArrowRight className="h-5 w-5" />
        </a>
        <p className="text-xs text-white/30 mt-4">Requires an active Stock Track PRO subscription.</p>
      </section>
    </div>
  );
}
