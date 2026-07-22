import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';

/** Update only when the terms text changes. */
const LAST_UPDATED = '22 July 2026';

export const metadata: Metadata = {
  title: 'Subscription Terms',
  description:
    'Subscription terms for Fleet Track PRO UK fleet software — 7-day trial, monthly and annual billing, cancellation, VAT, and renewal.',
  alternates: { canonical: '/subscription-terms' },
  openGraph: {
    title: 'Subscription Terms | Fleet Track PRO',
    description: 'Billing, trials, and cancellation terms for Fleet Track PRO subscriptions.',
    url: 'https://www.fleettrackpro.co.uk/subscription-terms',
    siteName: 'Fleet Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-3 text-slate-600">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)] shrink-0" aria-hidden />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SubscriptionTermsPage() {
  return (
    <div className="marketing-shell">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Subscription <span className="text-[var(--brand-blue)]">Terms</span>
          </h1>
          <p className="text-slate-500 mb-8">Last updated: {LAST_UPDATED}</p>

          <Section title="Introduction">
            <p className="text-slate-600 leading-relaxed mb-4">
              These Subscription Terms apply to all Fleet Track PRO subscriptions purchased through our website
              checkout (including fleet plans and optional Plant &amp; Machinery add-ons). The Fleet Track PRO
              mobile app is a companion app used by your team to log inspections, update defects, and complete
              fleet workflows. Subscriptions are not sold or renewed through the app itself.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              These Subscription Terms should be read alongside our{' '}
              <Link href="/terms" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Privacy Policy
              </Link>
              . If there is a conflict on billing, renewal, trial, or cancellation, these Subscription Terms
              take priority for those topics.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Fleet Track PRO is a software service sold for <strong className="text-slate-800">business use</strong>.
              It is not intended for consumers. The Consumer Contracts (Information, Cancellation and Additional
              Charges) Regulations 2013 and other consumer-only cooling-off rights do not apply to business
              subscriptions. By purchasing, you confirm you are buying as a business (or on behalf of a business)
              and have authority to bind that organisation.
            </p>
          </Section>

          <Section title="1. Plan model">
            <BulletList
              items={[
                'Pricing is per subscribed vehicle. Core fleet features are included on every fleet plan.',
                <>
                  Monthly billing: <strong className="text-slate-800">£8 per vehicle per month</strong>.
                </>,
                <>
                  Annual billing:{' '}
                  <strong className="text-slate-800">£84 per vehicle per year</strong> (approximately 12% less
                  than monthly, paid in advance).
                </>,
                'Minimum subscription quantity is 2 vehicles.',
                'Displayed pricing is in GBP and includes UK VAT at 20%, unless we state otherwise.',
                'Your subscribed vehicle count controls how many vehicles your company can manage at any one time.',
                'Published website prices may change for new customers. Existing customers are handled as set out in Sections 8 and 9.',
              ]}
            />
          </Section>

          <Section title="1a. Plant & Machinery add-on (optional)">
            <p className="text-slate-600 leading-relaxed mb-4">
              Plant &amp; Machinery is a separate subscription from your fleet vehicle plan. It is billed per
              active machine seat and managed through the same Stripe billing portal as your main subscription
              where applicable.
            </p>
            <BulletList
              items={[
                <>
                  Monthly billing: <strong className="text-slate-800">£12 per machine per month</strong>.
                </>,
                <>
                  Annual billing: <strong className="text-slate-800">£120 per machine per year</strong> (paid in
                  advance).
                </>,
                'Minimum quantity is 3 machines.',
                'Displayed pricing is in GBP and includes UK VAT at 20%, unless we state otherwise.',
                'Your subscribed machine quantity controls how many active plant machines your company can register at any one time.',
                'The 7-day fleet trial does not automatically include Plant & Machinery. Subscribe to the add-on from the Pricing page or dashboard when ready.',
                'Some early (“legacy”) customers have Plant & Machinery included without a separate add-on; agreed legacy terms continue until varied in writing.',
                'Cancellation, renewal, failed payments, and quantity changes for the plant add-on follow the same principles as the fleet subscription (Sections 3–6), applied to the plant subscription line in Stripe.',
              ]}
            />
          </Section>

          <Section title="2. Free trial">
            <BulletList
              items={[
                <>
                  New companies receive a <strong className="text-slate-800">7-day free trial</strong> of available
                  fleet product features. No payment card is required to start the trial.
                </>,
                'The trial ends automatically after 7 days. To continue, a manager must set up a paid subscription from the website or dashboard.',
                'If no subscription is set up by the end of the trial, we may contact you, restrict access to paid features, or suspend access.',
                'The trial is for evaluation only. We may refuse, shorten, or end a trial if we reasonably believe it is being misused, used for production beyond evaluation, or the company has already trialled the service.',
                'One trial per company, unless we agree otherwise in writing.',
              ]}
            />
          </Section>

          <Section title="3. Billing cycle and renewal">
            <BulletList
              items={[
                'Subscriptions renew automatically at the end of each billing period (monthly or yearly) unless cancelled before renewal.',
                'Subscriptions are billed by Stripe using the payment method you provide at checkout. You are responsible for keeping payment details current and accurate.',
                'By starting a paid subscription, you authorise recurring charges for the selected plan and quantity until cancelled in accordance with these terms.',
                'Managers can open the Stripe billing portal from the dashboard. Changes to billing cycle or subscribed quantity may need to be completed in the portal or via support, and usually take effect from the next billing cycle.',
                'Invoices and receipts are provided through Stripe. You are responsible for your own accounting and tax reporting beyond the VAT included in displayed prices.',
              ]}
            />
          </Section>

          <Section title="4. Quantity changes">
            <BulletList
              items={[
                'You can request an increase or decrease to subscribed vehicle or machine quantity through the billing portal or by contacting support.',
                'Quantity changes take effect at your next billing cycle. Your current paid period is not re-prorated, and no partial-period credit is given for mid-cycle reductions.',
                'Feature limits (vehicles or machines you can manage) are tied to the active subscribed quantity. If you reduce quantity below what you have registered, you may need to remove or deactivate excess items before the new limit applies.',
                'We may refuse or delay a quantity reduction that would leave unpaid or disputed balances outstanding.',
              ]}
            />
          </Section>

          <Section title="5. Cancellation and refunds">
            <BulletList
              items={[
                <>
                  <strong className="text-slate-800">Monthly plans:</strong> cancel at any time from the billing
                  portal. Cancellation takes effect at the end of the current paid month. You keep access until
                  that date. There is no long-term contract for monthly plans.
                </>,
                <>
                  <strong className="text-slate-800">Annual plans:</strong> these are a 12-month term paid upfront
                  at a discount. You may cancel renewal at any time so you are not charged again, but unused months
                  within the paid year are not refunded.
                </>,
                'Fees already paid are non-refundable except where required by law or where we have materially failed to provide the contracted service and have not remedied that failure within a reasonable time after written notice.',
                'Chargebacks or payment disputes raised without first contacting us may result in suspension of access while we investigate. We will work with Stripe and you to resolve genuine billing errors.',
                'Cancelling a fleet subscription does not automatically cancel a separate Plant & Machinery add-on, and vice versa, unless the billing portal shows a combined cancellation or we confirm otherwise in writing.',
              ]}
            />
          </Section>

          <Section title="6. Failed payments and suspension">
            <BulletList
              items={[
                <>
                  If a renewal payment fails, we will retry for a reasonable period through Stripe. During this time
                  the subscription may show as <em>past due</em>.
                </>,
                'If payment is not resolved, we may suspend access to the service. Suspended companies will not lose their data during a suspension period, but may be unable to add new inspections, defects, plant records, or team members.',
                'We will notify the account email on file before a subscription is suspended or terminated for non-payment.',
                'We may terminate a subscription for repeated non-payment, fraud, abuse, or material breach of these Subscription Terms or our Terms and Conditions.',
              ]}
            />
          </Section>

          <Section title="7. Data retention after cancellation">
            <BulletList
              items={[
                'After cancellation, your company data (vehicles, inspections, defects, plant machinery records where applicable, and team profiles) remains in our systems for a reasonable period so you can reactivate and recover data if needed.',
                <>
                  If your subscription has ended and has not been reactivated, you can request permanent deletion by
                  emailing{' '}
                  <a
                    href="mailto:help@fleettrackpro.co.uk"
                    className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
                  >
                    help@fleettrackpro.co.uk
                  </a>
                  .
                </>,
                <>
                  Backups and log files are retained on a rolling schedule in line with our{' '}
                  <Link
                    href="/privacy"
                    className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  .
                </>,
                'Export of your data before cancellation is your responsibility. We are not obliged to provide custom data extracts after deletion has been completed.',
              ]}
            />
          </Section>

          <Section title="8. Nature of the service">
            <BulletList
              items={[
                'Fleet Track PRO is a software tool to help you record inspections, defects, renewals, and related fleet or plant workflows. It does not replace professional advice, and it does not guarantee DVSA, MOT, LOLER, or any other regulatory outcome.',
                'You remain solely responsible for the roadworthiness of your vehicles, the condition of plant, compliance with applicable law, and the accuracy of information your users submit.',
                'We do not warrant uninterrupted availability. Planned maintenance, third-party outages (including Stripe, hosting, or push notification providers), or force majeure events may affect access. Such events do not automatically entitle you to a refund for the affected period.',
              ]}
            />
          </Section>

          <Section title="9. Existing and grandfathered customers">
            <p className="text-slate-600 leading-relaxed">
              Some early customers have agreed pricing or contract terms that differ from the rates published on
              our website. Those agreed terms continue to apply until varied in writing. If pricing changes are
              introduced, we may honour existing pricing for current customers at our discretion.
            </p>
          </Section>

          <Section title="10. Changes to pricing or terms">
            <p className="text-slate-600 leading-relaxed mb-4">
              We may update pricing or these Subscription Terms from time to time. Material changes will be
              communicated in advance by email or a notice in the dashboard. Continued use of a paid subscription
              after the effective date of a change constitutes acceptance of the updated terms, except where
              applicable law requires a different process.
            </p>
            <p className="text-slate-600 leading-relaxed">
              If you do not agree to a material change, you may cancel your subscription before the change takes
              effect, subject to the cancellation and refund rules in Section 5.
            </p>
          </Section>

          <Section title="11. Governing law">
            <p className="text-slate-600 leading-relaxed">
              These Subscription Terms are governed by the laws of England and Wales. The courts of England and
              Wales have exclusive jurisdiction over disputes arising from them, without prejudice to any
              mandatory rights you may have under applicable law.
            </p>
          </Section>

          <Section title="12. Contact">
            <p className="text-slate-600 leading-relaxed">
              Questions about billing or these Subscription Terms can be sent to{' '}
              <a
                href="mailto:help@fleettrackpro.co.uk"
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                help@fleettrackpro.co.uk
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
