import Link from 'next/link';
import type { Metadata } from 'next';
import { absolutePageUrl, canonicalPath } from '@/lib/site';
import { DELIVERY_PRICE_GBP_MONTHLY } from '@/lib/deliveryModule';

export const metadata: Metadata = {
  title: 'Delivery add-on',
  description:
    'Optional Fleet Track PRO Delivery add-on: manager-created jobs, driver staged collection and delivery, £15 per vehicle per month on top of fleet checks.',
  alternates: { canonical: canonicalPath('/features/delivery') },
  openGraph: {
    title: 'Delivery add-on | Fleet Track PRO',
    description:
      'Separate from daily vehicle checks. £15 per vehicle per month; quantity matches your fleet slots.',
    url: absolutePageUrl('/features/delivery'),
  },
};

export default function DeliveryFeaturePage() {
  return (
    <main className="min-h-screen bg-[var(--mkt-bg)] text-[var(--mkt-ink)]">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <p className="text-sm font-semibold text-[var(--brand-blue)] mb-3">Optional add-on</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          Delivery for your fleet
        </h1>
        <p className="text-lg text-[var(--mkt-muted)] leading-relaxed mb-8">
          Create jobs in the office, assign a response driver, and run a clear staged flow on the
          phone — collection, photos, hub confirmation, then delivery. Built as a separate product
          from daily vehicle checks so other customers are unaffected until you turn Delivery on.
        </p>

        <section className="mb-12 space-y-4">
          <h2 className="text-2xl font-semibold">How billing works</h2>
          <p className="text-[var(--mkt-muted)] leading-relaxed">
            Delivery is <strong>£{DELIVERY_PRICE_GBP_MONTHLY} per vehicle per month</strong>, on top of
            your £8 fleet check price. The Delivery quantity always matches your subscribed vehicle
            slots.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--mkt-muted)]">
            <li>
              Example: 3 vehicles for checks = £24/month. Add Delivery = +£45 → <strong>£69/month</strong>.
            </li>
            <li>Add another vehicle while Delivery is on → both lines increase (£8 + £15).</li>
            <li>Cancel Delivery → you stay on £8 × vehicles only.</li>
          </ul>
          <p className="text-[var(--mkt-muted)] leading-relaxed">
            Trials for Delivery are granted by Fleet Track PRO (separate from the 14-day fleet signup
            trial). See our{' '}
            <Link href="/subscription-terms/" className="text-[var(--brand-blue)] underline">
              Subscription Terms
            </Link>
            .
          </p>
        </section>

        <section className="mb-12 space-y-4">
          <h2 className="text-2xl font-semibold">What managers and drivers do</h2>
          <ul className="list-disc pl-5 space-y-2 text-[var(--mkt-muted)]">
            <li>
              <strong>Managers</strong> raise jobs on the website or app: job number, driver, item,
              collection and delivery hospitals, required arrival time.
            </li>
            <li>
              <strong>Drivers</strong> accept the staged flow: navigate to collection (Waze / Google /
              Apple Maps), arrive, collect with box and serial photos, confirm hub informed, then
              unlock navigate to delivery and complete.
            </li>
            <li>
              Optional <strong>Job stood down</strong> if the team is waiting and the job is cancelled
              mid-flow.
            </li>
          </ul>
        </section>

        <section className="mb-12 space-y-4">
          <h2 className="text-2xl font-semibold">Templates</h2>
          <p className="text-[var(--mkt-muted)] leading-relaxed">
            v1 ships a medical organ / tissue transport template (collection items such as Heart,
            Liver, Kidney, Blood, SNOD, Tissue, MISC, and hub-informed gates). The same Delivery engine
            can support other company templates later without changing vehicle checks.
          </p>
        </section>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/pricing/"
            className="inline-flex items-center rounded-lg bg-[var(--brand-blue)] px-5 py-3 text-white font-semibold"
          >
            View pricing
          </Link>
          <Link
            href="/subscription-terms/"
            className="inline-flex items-center rounded-lg border border-[var(--mkt-border)] px-5 py-3 font-semibold"
          >
            Subscription Terms
          </Link>
        </div>
      </div>
    </main>
  );
}
