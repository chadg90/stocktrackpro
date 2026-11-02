import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import AppStoreBadge from '@/components/AppStoreBadge';
import { absolutePageUrl, canonicalPath } from '@/lib/site';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/brand';

const path = '/getting-started';
const title = 'Getting started with Fleet Track PRO';
const description =
  'How managers set up Fleet Track PRO and how drivers download the app, pick a vehicle, and complete a daily walkaround check with photos.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: canonicalPath(path) },
  openGraph: {
    title: `${title} | Fleet Track PRO`,
    description,
    url: absolutePageUrl(path),
    type: 'website',
    locale: 'en_GB',
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | Fleet Track PRO`,
    description,
    images: ['/og-image.jpg'],
  },
};

function Section({ title: heading, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">{heading}</h2>
      {children}
    </section>
  );
}

export default function GettingStartedPage() {
  return (
    <div className="marketing-shell">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Getting started</h1>
          <p className="text-slate-600 text-lg leading-relaxed mb-10">
            A short guide for managers setting up the fleet, and for drivers using the Fleet Track PRO app for daily
            vehicle checks.
          </p>

          <Section title="For managers">
            <ol className="space-y-4 text-slate-600 list-decimal list-inside leading-relaxed">
              <li>
                <strong className="text-slate-800">Create your account and company</strong> on the website — no card
                required for the free trial. Start at{' '}
                <Link href="/onboarding/?start=1" className="text-[var(--brand-blue)] underline underline-offset-2">
                  Start free trial
                </Link>
                .
              </li>
              <li>
                <strong className="text-slate-800">Add your vehicles</strong> in the web dashboard. Registration look-up
                fills make and model details so you can build the fleet list quickly.
              </li>
              <li>
                <strong className="text-slate-800">Invite drivers</strong> from the Team page by email. Each person sets
                a password from the invite link, then signs in on the mobile app.
              </li>
              <li>
                <strong className="text-slate-800">Review defects and MOT / tax dates</strong> in the dashboard —
                open defects, inspection history, and upcoming MOT or tax renewals appear against each vehicle so you
                can prioritise follow-up.
              </li>
            </ol>
          </Section>

          <Section title="For drivers">
            <ol className="space-y-4 text-slate-600 list-decimal list-inside leading-relaxed mb-6">
              <li>
                <strong className="text-slate-800">Download the Fleet Track PRO app</strong> from the App Store and sign
                in with the email and password from your invite.
              </li>
              <li>
                <strong className="text-slate-800">Accept the invite</strong> if you have not finished setup yet — open
                the email from your manager, set your password, then return to the app.
              </li>
              <li>
                <strong className="text-slate-800">Pick a vehicle</strong> from your company list before you start the
                day&apos;s check.
              </li>
              <li>
                <strong className="text-slate-800">Complete the walkaround check</strong> — follow the structured
                checklist, add the required photos (including the odometer), and submit so the check is named and
                timestamped.
              </li>
              <li>
                <strong className="text-slate-800">Report a defect</strong> if you find a problem during the check —
                describe it, attach photos where needed, and send it to your manager for close-out.
              </li>
            </ol>
            <AppStoreBadge />
          </Section>

          <Section title="Need help?">
            <p className="text-slate-600 leading-relaxed">
              Email{' '}
              <a
                href={SUPPORT_MAILTO}
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                {SUPPORT_EMAIL}
              </a>{' '}
              or use the{' '}
              <Link href="/contact/" className="text-[var(--brand-blue)] underline underline-offset-2">
                Contact
              </Link>{' '}
              page. For product questions, see the{' '}
              <Link href="/faq/" className="text-[var(--brand-blue)] underline underline-offset-2">
                FAQ
              </Link>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
