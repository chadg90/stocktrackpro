import React from 'react';
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { Car, Users, Wrench, Shield, Gauge, FileCheck, ArrowRight, Smartphone } from 'lucide-react';

const WHATSAPP_ENQUIRY_URL =
  'https://wa.me/447438146343?text=Hi%20Stock%20Track%20PRO%2C%20I%27d%20like%20to%20get%20started%20with%20your%20service.';

export const metadata: Metadata = {
  title: 'Features | Stock Track PRO',
  description:
    'Every feature in Stock Track PRO: fleet management, vehicle inspections, defect workflow from flagged to fixed, MOT & tax monitoring, team roles, and manager dashboard.',
  alternates: { canonical: '/features' },
};

type Feature = {
  title: string;
  icon: React.ElementType;
  summary: string;
  bullets: string[];
  useCase: string;
};

const features: Feature[] = [
  {
    title: 'Mobile-first fleet workflows',
    icon: Smartphone,
    summary:
      'Use the mobile app to run daily inspections, defect updates, and handovers quickly. Every action is time-stamped and tied to the user for clear accountability.',
    bullets: [
      'Faster daily vehicle checks from the mobile app',
      'Consistent inspection flows across teams and sites',
      'Time-stamped activity history tied to each user',
      'Cleaner handovers between drivers, managers and fitters',
    ],
    useCase:
      'Instead of paper forms and WhatsApp updates, every check is recorded in one consistent digital flow.',
  },
  {
    title: 'Fleet management',
    icon: Car,
    summary:
      'Track every vehicle in your fleet from one dashboard. Registration lookups, mileage, inspection history, and service information stay up to date without manual admin.',
    bullets: [
      'Add vehicles by registration — DVLA details populate automatically',
      'Live mileage baseline with spotting of unusual increases',
      'Assign vehicles to drivers and set usage expectations',
      'View every vehicle’s full inspection and defect history',
    ],
    useCase:
      'Managers see at a glance which vehicles need attention, which are overdue for inspection, and who’s driving what.',
  },
  {
    title: 'Vehicle inspections',
    icon: Wrench,
    summary:
      'Structured pre-use inspections with required photos and a clear checklist. Drivers cannot skip steps, and every submission is time-stamped and attributed.',
    bullets: [
      'Six-photo walkaround (front, rear, driver side, passenger side, interior, odometer)',
      'Overall condition plus per-item checklist',
      'Automatic mileage capture from the odometer photo step',
      'Managers get notified immediately when a defect is raised',
    ],
    useCase:
      'When a problem arises, you have a documented record that the vehicle was checked and by whom — useful for insurance, clients, and compliance.',
  },
  {
    title: 'Defect workflow: flagged to fixed',
    icon: Shield,
    summary:
      'Defects do not get stuck in a spreadsheet. The moment a driver raises one, the vehicle moves into maintenance, your fitter sees it in their My Jobs list, and everyone can track progress through to resolution — scheduled, waiting for parts, or completed.',
    bullets: [
      'Severity levels and mandatory descriptions at the point of reporting',
      'Vehicle fleet status updates automatically when a defect is raised',
      'Fitter My Jobs screen groups open defects by vehicle and priority',
      'Each defect tracked through Open → Scheduled → Waiting for parts → Completed',
      'Reporter name and contact number surfaced so fitters can clarify quickly',
      'One-tap resolve returns a vehicle to active — blocked automatically if any defect is still open',
      'Full history of past defects per vehicle, inspector and fitter',
    ],
    useCase:
      'A driver flags a brake issue at 7am. The vehicle shows as in maintenance, the fitter sees it on their phone, marks it Waiting for parts, and resolves the job once fitted — the vehicle returns to active automatically, with a complete audit trail.',
  },
  {
    title: 'MOT and tax monitoring',
    icon: FileCheck,
    summary:
      'Connected to DVLA data so MOT dates, tax status, and vehicle details refresh on demand. Avoid the fine and the awkward conversation with a customer.',
    bullets: [
      'See MOT and tax status on every vehicle card',
      'On-demand refresh direct from DVLA per vehicle',
      'Cached to stay fast and keep API usage predictable',
      'Flagging of vehicles approaching MOT or with expired tax',
    ],
    useCase:
      'No spreadsheet of expiry dates, no forgotten renewals — the dashboard tells you before it matters.',
  },
  {
    title: 'Team roles and permissions',
    icon: Users,
    summary:
      'Two clean roles keep the system simple. Managers get full company-wide oversight from the web dashboard; staff use the mobile app to do their day job.',
    bullets: [
      'Invite team members by email in single or bulk',
      'Scoped access — staff only see what they need',
      'Managers handle vehicles, inspections, reporting, and billing',
      'Remove or reassign team members at any time',
    ],
    useCase:
      'Onboarding a new driver takes under a minute — they download the app, accept the invite, and they are inspecting the same day.',
  },
  {
    title: 'Manager dashboard',
    icon: Gauge,
    summary:
      'A single web dashboard for everything a manager needs: fleet status, defect alerts, team activity, and subscription management.',
    bullets: [
      'At-a-glance metrics for vehicles, inspections, defects and team',
      'Defect notifications with full context',
      'Reports and exports for insurance or audit requests',
      'Manage vehicle count and billing cycle from one place',
    ],
    useCase:
      'You start the day, open the dashboard, and know exactly what needs attention — no chasing, no phone calls.',
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="container relative mx-auto px-4">
          <p className="text-blue-500 font-medium text-sm uppercase tracking-[0.2em] mb-4 text-center">
            Features
          </p>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              Everything a fleet manager actually needs
            </h1>
            <p className="text-lg text-white/75 leading-relaxed">
              No bloat. No upsells to other products. One subscription covers
              fleet management, inspections, defect workflow, and compliance
              across iOS, Android, and the web dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Feature deep dives */}
      <section className="py-16 sm:py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group p-7 sm:p-10 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                        {feature.title}
                      </h2>
                      <p className="text-white/75 leading-relaxed mb-5">
                        {feature.summary}
                      </p>
                      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-5">
                        {feature.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-2.5 text-sm text-white/80"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <span className="leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-white/55 italic border-l-2 border-blue-500/40 pl-4">
                        {feature.useCase}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-24 overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            See how it fits your business
          </h3>
          <p className="text-white/70 max-w-lg mx-auto mb-8">
            Every feature on this page is included in a single subscription.
            Monthly (£8 per vehicle) or annual (£84 per vehicle, save ~12%).
            No long-term contract.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] btn-brand-blue"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white hover:border-blue-500/50 hover:bg-white/5 transition-all duration-200 font-medium"
            >
              View pricing
            </Link>
          </div>
          <p className="mt-5 text-sm text-white/50">
            7 days free &bull; no card required &bull;{' '}
            <a
              href={WHATSAPP_ENQUIRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white underline underline-offset-2"
            >
              or talk to us on WhatsApp
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
