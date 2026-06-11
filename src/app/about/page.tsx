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
          Built for UK fleet operators who are tired of spreadsheets
        </h1>
        <p className="text-white/80 text-lg leading-relaxed mb-6">
          Stock Track PRO was built because the tools available to small fleet operators were either overpriced
          enterprise software or a combination of spreadsheets and WhatsApp messages that let things fall through the
          cracks.
        </p>
        <p className="text-white/75 text-lg leading-relaxed mb-10">
          We built one platform that does what fleet managers actually need — inspections, defect close-out, and MOT
          visibility — without the complexity or the cost.
        </p>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">Why Stock Track PRO exists</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Paper sheets get lost. Group chats bury urgent defects. MOT dates live in someone&apos;s memory until
              they are not. Managers end up chasing drivers and fitters instead of running the business.
            </p>
            <p className="text-white/70 leading-relaxed">
              Stock Track PRO keeps daily checks, defect workflow, and renewal visibility in one place — mobile app for
              the field, web dashboard for managers — so records are timestamped and searchable when you need them.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">Who it is built for</h2>
            <p className="text-white/70 leading-relaxed">
              UK trades, groundworks, logistics, construction, haulage, and contractor businesses — from sole traders with
              a handful of vans to teams managing larger mixed fleets. Optional Plant &amp; Machinery covers LOLER and
              site plant when you need it.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">How teams use it</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Managers use the web dashboard to add vehicles, review inspections, manage defects, monitor MOT and tax
              status, invite team members, and handle billing.
            </p>
            <p className="text-white/70 leading-relaxed">
              Drivers (user role) and fitters (manager role) use the iOS and Android app for daily inspections,
              photo-evidenced defect reports, My Jobs, and close-out when work is complete.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">In the field</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              See how a groundworks contractor uses Stock Track PRO across multiple sites.
            </p>
            <Link
              href="/customers/newstreet"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium underline underline-offset-4"
            >
              Newstreet Groundworks case study →
            </Link>
          </section>

          <section className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-3">Pricing and support</h2>
            <p className="text-white/75 leading-relaxed mb-5">
              Fleet pricing, the 7-day free trial, and optional Plant &amp; Machinery are on our{' '}
              <Link href="/pricing" className="text-blue-300 hover:text-blue-200 underline underline-offset-4">
                pricing page
              </Link>
              . Support is UK-based via email and WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white btn-brand-blue"
              >
                Try free for 7 days
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium border border-white/20 hover:bg-white/5"
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
