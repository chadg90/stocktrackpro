import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const LAST_UPDATED = '14 April 2026';

export const metadata: Metadata = {
  title: 'Subscription Terms | Stock Track PRO',
  description:
    'Subscription terms for Stock Track PRO: free trial, monthly and annual billing, cancellation, data retention and grandfathered pricing.',
  alternates: { canonical: '/subscription-terms' },
};

export default function SubscriptionTermsPage() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-white mb-2">Subscription Terms</h1>
            <p className="text-zinc-400 mb-6">Last updated: {LAST_UPDATED}</p>

            <p className="text-zinc-300 mb-4">
              These Subscription Terms apply to all paid Stock Track PRO subscriptions purchased
              through our website checkout. The Stock Track PRO mobile app is a companion app used
              by your team to log inspections, update defects and complete fleet workflows; subscriptions are
              not sold or renewed through the app itself. These Subscription Terms should be read
              alongside our{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-zinc-300 mb-8">
              Stock Track PRO is a software service sold for business use. The service is not
              intended for consumers, and the Consumer Contracts (Information, Cancellation and
              Additional Charges) Regulations 2013 do not apply to business subscriptions.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Plan Model</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4 space-y-1.5">
              <li>Pricing is per subscribed vehicle. All features are included on every plan.</li>
              <li>
                Monthly billing: <span className="text-white">&pound;8 per vehicle per month</span>.
              </li>
              <li>
                Annual billing: <span className="text-white">&pound;84 per vehicle per year</span>{' '}
                (approximately 12% less than monthly, paid in advance).
              </li>
              <li>Minimum subscription quantity is 5 vehicles.</li>
              <li>Displayed pricing is in GBP and includes UK VAT at 20%.</li>
              <li>
                Your subscribed vehicle count controls the total number of vehicles your company can
                manage at any one time in the platform.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Free Trial</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4 space-y-1.5">
              <li>
                New companies receive a <span className="text-white">7-day free trial</span> of the
                full product. No payment card is required to start the trial.
              </li>
              <li>
                The trial ends automatically after 7 days. To continue using the service, a manager
                must set up a paid subscription from the dashboard.
              </li>
              <li>
                If no subscription is set up by the end of the trial, the account will be placed
                into a read-only state and eventually suspended (see section 6).
              </li>
              <li>
                The trial is intended for evaluation. We reserve the right to refuse, shorten or end
                a trial if we reasonably believe the trial is being misused or the company has
                already trialled the service.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Billing Cycle and Renewal</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4 space-y-1.5">
              <li>
                Subscriptions renew automatically at the end of each billing period (monthly or
                yearly) unless cancelled before renewal.
              </li>
              <li>Subscriptions are billed by Stripe using the payment method you provide at checkout.</li>
              <li>
                You can switch between monthly and annual billing from the dashboard. A change from
                monthly to annual takes effect at the next renewal.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Vehicle Quantity Changes</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4 space-y-1.5">
              <li>
                You can increase or decrease your subscribed vehicle quantity from the dashboard at
                any time.
              </li>
              <li>
                Quantity changes take effect at your next billing cycle. Your current paid period is
                not re-prorated.
              </li>
              <li>
                Feature limits (the number of vehicles you can manage) are tied to the active
                subscribed vehicle quantity.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">5. Cancellation and Refunds</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4 space-y-1.5">
              <li>
                <span className="text-white">Monthly plans:</span> you can cancel at any time from
                the billing portal. Cancellation takes effect at the end of the current paid month.
                You keep access to the service until that date. There is no long-term contract.
              </li>
              <li>
                <span className="text-white">Annual plans:</span> these are a 12-month term paid
                upfront at a discount. You can cancel renewal at any time (so you will not be
                charged again), but unused months within the paid year are not refunded.
              </li>
              <li>
                Fees already paid are non-refundable except where required by law or where we have
                materially failed to provide the service.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">6. Failed Payments and Suspension</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4 space-y-1.5">
              <li>
                If a renewal payment fails, we will retry for a reasonable period through Stripe.
                During this time the subscription will show as <em>past due</em>.
              </li>
              <li>
                If payment is not resolved, we may suspend access to the service. Suspended
                companies will not lose their data during a suspension period, but may be unable to
                add new inspections, defects, or team members.
              </li>
              <li>
                We will let you know by email before a subscription is suspended or terminated due
                to non-payment.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">7. Data Retention After Cancellation</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4 space-y-1.5">
              <li>
                After cancellation, your company data (vehicles, inspections, defects, and team
                profiles) remains in our systems for a reasonable period so that you can
                reactivate your subscription and recover your data if needed.
              </li>
              <li>
                If your subscription has ended and has not been reactivated, you can request
                permanent deletion of your company data at any time by emailing{' '}
                <a href="mailto:support@stocktrackpro.co.uk" className="text-blue-400 hover:text-blue-300">
                  support@stocktrackpro.co.uk
                </a>
                .
              </li>
              <li>
                Backups and log files are retained on a rolling schedule in line with our{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </Link>
                .
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">8. Existing and Grandfathered Customers</h2>
            <p className="text-zinc-300 mb-4">
              Some early customers have agreed pricing or contract terms that differ from the rates
              published on our website. Those agreed terms continue to apply to those customers
              until varied in writing. If pricing changes are introduced, we may honour existing
              pricing for current customers at our discretion.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">9. Changes to Pricing or Terms</h2>
            <p className="text-zinc-300 mb-4">
              We may update pricing or these Subscription Terms from time to time. Material changes
              will be communicated in advance by email or a notice in the dashboard. If you do not
              agree to a change, you may cancel your subscription before the change takes effect.
            </p>

            <h2 className="text-2xl font-bold text-white mt-10 mb-4">10. Contact</h2>
            <p className="text-zinc-300 mb-8">
              Questions about billing or these Subscription Terms can be sent to{' '}
              <a href="mailto:support@stocktrackpro.co.uk" className="text-blue-400 hover:text-blue-300">
                support@stocktrackpro.co.uk
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
