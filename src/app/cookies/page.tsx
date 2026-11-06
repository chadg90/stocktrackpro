import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/brand';

/** Update only when the policy text changes. */
const LAST_UPDATED = '2 November 2026';

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
              storage (for example to remember your cookie choice, or to keep you signed in to the dashboard). This
              policy explains what we use on www.fleettrackpro.co.uk.
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
                  dashboard, and storing your analytics preference in local storage (
                  <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">ftp_consent</code>).
                </>,
                <>
                  <strong className="text-slate-800">Payment (Stripe)</strong> — when you start checkout or open the
                  billing portal, Stripe may set its own cookies on Stripe-controlled domains to process payments
                  securely and prevent fraud. Those cookies are governed by Stripe’s policies.
                </>,
                <>
                  <strong className="text-slate-800">Google Analytics 4 (marketing pages only, opt-in)</strong> — after
                  you choose <em>Accept</em>, we use Google Analytics 4 on marketing pages (for example home,
                  pricing, features, and articles) to see which pages help. We do not load Analytics on the manager
                  dashboard or other signed-in product areas. The cookies used are{' '}
                  <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">_ga</code> and{' '}
                  <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">_ga_&lt;container-id&gt;</code>, which
                  may last up to 13 months. We configure GA4 data retention to match (14 months maximum). IP addresses
                  are not stored by GA4. There are no advertising or remarketing cookies. Google acts as a processor;
                  see{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Google’s Privacy Policy
                  </a>
                  .
                </>,
                <>
                  <strong className="text-slate-800">No advertising cookies</strong> — we do not use third-party
                  advertising, remarketing, or tracking pixels on the marketing site.
                </>,
                <>
                  <strong className="text-slate-800">Dashboard product usage</strong> — when you are signed in to the
                  manager dashboard, we record first-party feature/page usage counts in our Firebase database so we
                  can improve popular tools and simplify unused ones. Platform admin/ops screens are excluded. These
                  counts are not used for advertising.
                </>,
              ]}
            />
          </Section>

          <Section title="3. Mobile app">
            <p className="text-slate-600 leading-relaxed">
              The companion mobile app uses device storage, secure storage, and push notification tokens as needed
              to provide the Service. That is described in our{' '}
              <Link href="/privacy/" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Privacy Policy
              </Link>
              ; it is separate from website cookies.
            </p>
          </Section>

          <Section title="4. Your choices">
            <BulletList
              items={[
                'Essential technologies are required for the Service to work. You can block cookies in your browser, but sign-in and some features may fail.',
                <>
                  Analytics cookies are optional. You can Accept or Reject them in our banner, and change your mind
                  later via <strong className="text-slate-800">Cookie settings</strong> in the website footer.
                </>,
                'If we introduce non-essential advertising cookies in future, we will update this policy and, where required by law, ask for consent before setting them.',
              ]}
            />
          </Section>

          <Section title="5. Related policies">
            <p className="text-slate-600 leading-relaxed">
              Personal data processing is explained in our{' '}
              <Link href="/privacy/" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Privacy Policy
              </Link>
              . Use of the Service is governed by our{' '}
              <Link href="/terms/" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
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
