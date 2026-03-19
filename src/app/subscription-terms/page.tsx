'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function SubscriptionTermsPage() {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-white mb-8">Subscription Terms</h1>
            <p className="text-zinc-400 mb-6">Last Updated: {currentDate}</p>

            <p className="text-zinc-300 mb-8">
              These Subscription Terms apply to all paid StockTrackPro subscriptions purchased through our website checkout.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Plan Model</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4">
              <li>Standard pricing is charged per subscribed vehicle, per month.</li>
              <li>Minimum subscription quantity is 5 vehicles.</li>
              <li>Displayed pricing is in GBP and may be subject to VAT or applicable taxes.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Billing Cycle and Renewal</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4">
              <li>Subscriptions renew automatically each month unless cancelled before renewal.</li>
              <li>Billing is processed by Stripe using your selected payment method.</li>
              <li>Failed payments may result in suspension of subscription features until resolved.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Vehicle Quantity Changes</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4">
              <li>You can request a change to subscribed vehicle quantity from your dashboard workflow.</li>
              <li>Vehicle quantity amendments are applied from the next billing cycle.</li>
              <li>Feature limits are tied to the active subscribed vehicle quantity.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Cancellation</h2>
            <ul className="list-disc pl-6 text-zinc-300 mb-4">
              <li>You may cancel your subscription through the billing portal.</li>
              <li>Cancellation takes effect at the end of the current paid billing period.</li>
              <li>Fees already paid are non-refundable unless required by law.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Changes to Pricing or Terms</h2>
            <p className="text-zinc-300 mb-4">
              We may update pricing or these Subscription Terms from time to time. Material changes will be communicated in advance where required.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Related Policies</h2>
            <p className="text-zinc-300 mb-8">
              These Subscription Terms sit alongside our{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
              .
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Contact</h2>
            <p className="text-zinc-300 mb-8">
              Questions about billing or these Subscription Terms can be sent to support@stocktrackpro.co.uk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
