import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import {
  EDITORIAL_TEAM_NAME,
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
} from '@/lib/brand';

export default function AboutPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <main className="mkt-container pt-24 sm:pt-32 pb-20 max-w-4xl">
        <p className="mkt-eyebrow mb-4">
          About Fleet Track PRO
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--mkt-ink)] mb-6">
          Built for UK fleet operators who are tired of spreadsheets
        </h1>
        <p className="text-[var(--mkt-muted)] text-lg leading-relaxed mb-6">
          Fleet Track PRO was built because the tools available to small fleet operators were either overpriced
          enterprise software or a combination of spreadsheets and WhatsApp messages that let things fall through the
          cracks.
        </p>
        <p className="text-[var(--mkt-muted)] text-lg leading-relaxed mb-10">
          We built one platform that does what fleet managers actually need — DVSA walkaround checks, defect close-out,
          and MOT visibility — without the complexity or the cost. It is built for businesses operating cars, vans, and
          light commercial vehicles.
        </p>

        <div className="grid gap-6">
          <section className="mkt-card-static p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-[var(--mkt-ink)] mb-3">Why Fleet Track PRO exists</h2>
            <p className="text-[var(--mkt-muted)] leading-relaxed mb-4">
              Paper sheets get lost. Group chats bury urgent defects. MOT dates live in someone&apos;s memory until
              they are not. Managers end up chasing drivers and fitters instead of running the business.
            </p>
            <p className="text-[var(--mkt-muted)] leading-relaxed">
              Fleet Track PRO keeps daily checks, defect workflow, and renewal visibility in one place — mobile app for
              the field, web dashboard for managers — so records are timestamped and searchable when you need them.
            </p>
          </section>

          <section className="mkt-card-static p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-[var(--mkt-ink)] mb-3">Who it is built for</h2>
            <p className="text-[var(--mkt-muted)] leading-relaxed">
              UK trades, groundworks, logistics, construction, haulage, and contractor businesses — from sole traders with
              a handful of vehicles to teams managing larger mixed fleets.
            </p>
          </section>

          <section className="mkt-card-static p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-[var(--mkt-ink)] mb-3">How teams use it</h2>
            <p className="text-[var(--mkt-muted)] leading-relaxed mb-4">
              Managers use the web dashboard to add vehicles, review inspections, manage defects, monitor MOT and tax
              status, invite team members, and handle billing.
            </p>
            <p className="text-[var(--mkt-muted)] leading-relaxed">
              Drivers (user role) and fitters (manager role) use the iOS and Android app for daily inspections,
              photo-evidenced defect reports, My Jobs, and close-out when work is complete.
            </p>
          </section>

          <section
            id="editorial-team"
            className="scroll-mt-28 mkt-card-static p-6 sm:p-8"
          >
            <h2 className="text-2xl font-semibold text-[var(--mkt-ink)] mb-3">{EDITORIAL_TEAM_NAME}</h2>
            <p className="text-[var(--mkt-muted)] leading-relaxed mb-4">
              Our Compliance Centre articles are prepared and maintained by the Fleet Track PRO team for UK fleet
              operators. We prioritise primary guidance from GOV.UK, DVSA and the HSE, and clearly link to official or
              attributable industry sources where they support an article.
            </p>
            <p className="text-[var(--mkt-muted)] leading-relaxed mb-4">
              Articles show their publication and update dates. They provide general operational information rather
              than legal advice, and readers should check the latest official guidance for their vehicles and
              circumstances.
            </p>
            <p className="text-[var(--mkt-muted)] leading-relaxed">
              To report an error or suggest a correction, email{' '}
              <a
                href={SUPPORT_MAILTO}
                className="text-[var(--brand-blue)] hover:text-[var(--brand-blue-hover)] underline underline-offset-4"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section className="mkt-card-static p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-[var(--mkt-ink)] mb-3">In the field</h2>
            <p className="text-[var(--mkt-muted)] leading-relaxed mb-4">
              See how UK operators use Fleet Track PRO across groundworks and emergency medical transport fleets.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/customers/newstreet"
                className="text-[var(--brand-blue)] hover:text-[var(--brand-blue-hover)] text-sm font-medium underline underline-offset-4"
              >
                Newstreet Groundworks case study →
              </Link>
              <Link
                href="/customers/neemt"
                className="text-[var(--brand-blue)] hover:text-[var(--brand-blue-hover)] text-sm font-medium underline underline-offset-4"
              >
                NEEMT emergency vehicle fleet case study →
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--brand-blue)]/25 bg-[var(--mkt-muted-surface)] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-[var(--mkt-ink)] mb-3">Pricing and support</h2>
            <p className="text-[var(--mkt-muted)] leading-relaxed mb-5">
              Fleet is £8 per vehicle per month (min 2 vehicles). Full detail and the 14-day free trial are on our{' '}
              <Link href="/pricing" className="text-[var(--brand-blue)] hover:underline underline-offset-4">
                pricing page
              </Link>
              . Support is UK-based via email and WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white btn-brand-blue"
              >
                Try free for 14 days
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium border border-[var(--mkt-border)] bg-white hover:bg-slate-50"
              >
                Contact us
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
