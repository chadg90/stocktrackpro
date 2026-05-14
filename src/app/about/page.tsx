import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 sm:pt-32 pb-20 max-w-4xl">
        <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-4">
          About Stock Track PRO
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          UK fleet compliance software for trades and contractors
        </h1>
        <p className="text-white/75 text-lg leading-relaxed mb-10">
          Stock Track PRO is UK fleet management and fleet compliance software for small and medium-sized businesses. It helps teams record daily vehicle inspections, report defects with photo evidence, monitor MOT and tax dates, and keep timestamped digital records that support operational and O-licence compliance.
        </p>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">Who it is built for</h2>
            <p className="text-white/70 leading-relaxed">
              Stock Track PRO is built for fleet operators across the United Kingdom, including trades, groundworks, logistics, construction, haulage, electrical, plumbing and contractor businesses. It works for sole traders with a small number of vehicles and for growing teams managing larger mixed fleets.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">The problem it solves</h2>
            <p className="text-white/70 leading-relaxed">
              Paper inspection sheets, spreadsheets and message threads make it easy for defects to be missed, delayed or hard to prove later. Stock Track PRO keeps inspections, defect reports, repair progress and renewal reminders in one system so managers can see what needs attention before it becomes downtime, a compliance issue or a customer problem.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">How it works</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Managers use the web dashboard to add vehicles, review inspections, manage defects, monitor MOT and tax status, invite team members, and view fleet analytics.
            </p>
            <p className="text-white/70 leading-relaxed">
              Drivers (user role) and fitters (manager role) use the iOS and Android mobile app to complete daily inspections, submit photo-evidenced defect reports, receive job updates, and close repairs out when work is complete.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">Pricing and support</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Stock Track PRO costs £8 per vehicle per month, including VAT at 20%, with a 7-day free trial and no card required.
            </p>
            <p className="text-white/70 leading-relaxed">
              Support is UK-based via email and WhatsApp, so operators can get practical help from people who understand UK fleet workflows.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">Contact</h2>
            <p className="text-white/75 leading-relaxed mb-5">
              Questions about Stock Track PRO, pricing or setup can be sent to{' '}
              <a href="mailto:support@stocktrackpro.co.uk" className="text-blue-300 hover:text-blue-200 underline underline-offset-4">
                support@stocktrackpro.co.uk
              </a>
              .
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white btn-brand-blue"
            >
              Try free for 7 days
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
