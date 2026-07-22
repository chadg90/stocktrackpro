import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/brand';

/** Update only when the policy text changes. */
const LAST_UPDATED = '22 July 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

export default function CookiePolicy() {
  return (
    <div className="marketing-shell">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Cookie <span className="text-[var(--brand-blue)]">Policy</span>
          </h1>
          <p className="text-slate-500 mb-8">Last updated: {LAST_UPDATED}</p>

          <Section title="1. What are cookies?">
            <p className="text-slate-600 leading-relaxed">
              Cookies are small text files stored on your device. We also use similar technologies such as local
              storage (for example to remember that you have seen our cookie notice, or to keep you signed in to the
              dashboard). This policy explains what we use on www.fleettrackpro.co.uk.
            </p>
          </Section>

          <Section title="2. What we use today">
            <p className="text-slate-600 leading-relaxed mb-4">
              We aim to keep cookie use minimal. As of the date above:
            </p>
            <BulletList
              items={[
                <>
                  <strong className="text-slate-800">Essential / strictly necessary</strong> — required to operate
                  the site and Service: security, load balancing where applicable, authentication sessions for the
                  dashboard, and storing your cookie-notice choice in local storage (
                  <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">cookieConsent</code>).
                </>,
                <>
                  <strong className="text-slate-800">Payment (Stripe)</strong> — when you start checkout or open the
                  billing portal, Stripe may set its own cookies on Stripe-controlled domains to process payments
                  securely and prevent fraud. Those cookies are governed by Stripe’s policies.
                </>,
                <>
                  <strong className="text-slate-800">No advertising cookies</strong> — we do not currently use
                  third-party advertising or tracking pixels on the marketing site.
                </>,
                <>
                  <strong className="text-slate-800">No third-party analytics cookies</strong> — we do not currently
                  load Google Analytics, Meta Pixel, or similar analytics cookies on the marketing site.
                </>,
              ]}
            />
          </Section>

          <Section title="3. Mobile app">
            <p className="text-slate-600 leading-relaxed">
              The companion mobile app uses device storage, secure storage, and push notification tokens as needed
              to provide the Service. That is described in our{' '}
              <Link href="/privacy" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Privacy Policy
              </Link>
              ; it is separate from website cookies.
            </p>
          </Section>

          <Section title="4. Your choices">
            <BulletList
              items={[
                'Essential technologies are required for the Service to work. You can block cookies in your browser, but sign-in and some features may fail.',
                'Our site banner records whether you have acknowledged this notice. Because we do not currently set optional analytics or advertising cookies, declining optional categories is not applicable at this time.',
                'If we introduce non-essential cookies in future (for example analytics), we will update this policy and, where required by law, ask for consent before setting them.',
              ]}
            />
          </Section>

          <Section title="5. Related policies">
            <p className="text-slate-600 leading-relaxed">
              Personal data processing is explained in our{' '}
              <Link href="/privacy" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Privacy Policy
              </Link>
              . Use of the Service is governed by our{' '}
              <Link href="/terms" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Terms and Conditions
              </Link>
              .
            </p>
          </Section>

          <Section title="6. Contact">
            <p className="text-slate-600 leading-relaxed">
              Questions:{' '}
              <a
                href={SUPPORT_MAILTO}
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
