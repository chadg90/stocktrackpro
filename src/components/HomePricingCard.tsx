import Link from 'next/link';
import { Check } from 'lucide-react';

const FEATURES = [
  'Unlimited Vehicle Inspections',
  'Full Defect Close-out Workflow',
  '7-Day MOT & Tax Smart Alerts',
  'Manager Web Analytics Dashboard',
  'iOS & Android App Access',
  'No Setup Fees & UK Support',
  'Full Onboarding Support',
];

export default function HomePricingCard() {
  return (
    <section id="pricing" className="py-20 sm:py-28 border-t border-white/10 bg-white/[0.02]">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="text-center mb-10">
          <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Simple fleet pricing</h2>
          <p className="text-white/55 text-sm max-w-md mx-auto">
            National UK fleet compliance software — one flat rate, full feature set.
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/60 backdrop-blur-sm p-8 sm:p-10 shadow-xl shadow-blue-500/10">
          <div className="text-center border-b border-white/10 pb-8 mb-8">
            <p className="text-5xl sm:text-6xl font-bold text-white">
              £8
              <span className="text-lg sm:text-xl font-semibold text-white/60"> / vehicle / month</span>
            </p>
            <p className="text-white/55 text-sm mt-3">All prices include VAT at 20%.</p>
            <p className="text-white/55 text-sm">Annual billing is available at £84 per vehicle per year.</p>
            <p className="text-white/55 text-sm">Cancel anytime. No minimum contract.</p>
          </div>

          <p className="text-center font-semibold text-white mb-6">
            Every plan includes unlimited Driver, Fitter, and Manager accounts.
          </p>

          <ul className="space-y-3 mb-10">
            {FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/85 text-sm">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/onboarding"
            className="flex w-full items-center justify-center px-8 py-4 rounded-xl text-white font-semibold btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black"
          >
            Start 7-Day Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
}
