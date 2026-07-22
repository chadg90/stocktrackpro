import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { SITE_LEGAL_NAME, SITE_NAME, SITE_URL, SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/brand';

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

export default function PrivacyPolicy() {
  return (
    <div className="marketing-shell">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Privacy <span className="text-[var(--brand-blue)]">Policy</span>
          </h1>
          <p className="text-slate-500 mb-8">Last updated: {LAST_UPDATED}</p>

          <Section title="1. Introduction">
            <p className="text-slate-600 leading-relaxed mb-4">
              {SITE_LEGAL_NAME} (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) trades as{' '}
              <strong className="text-slate-800">{SITE_NAME}</strong>. This policy explains what personal data we
              collect, why we collect it, how we use it, and your rights when using our website, dashboard, and
              companion mobile app.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Read this together with our{' '}
              <Link href="/terms" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Terms and Conditions
              </Link>
              ,{' '}
              <Link
                href="/subscription-terms"
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                Subscription Terms
              </Link>
              , and{' '}
              <Link href="/cookies" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Cookie Policy
              </Link>
              .
            </p>
          </Section>

          <Section title="2. Who is the controller?">
            <BulletList
              items={[
                <>
                  For account, billing, website, and support data relating to how we operate {SITE_NAME},{' '}
                  <strong className="text-slate-800">{SITE_LEGAL_NAME}</strong> is the data controller.
                </>,
                'For fleet, inspection, defect, plant, and team records that your organisation stores in the Service, your organisation is typically the data controller, and we act as a processor on your instructions to provide the Service.',
                'If you are an employee or contractor using the app for your employer, contact your employer first about access, correction, or deletion of workplace records.',
              ]}
            />
          </Section>

          <Section title="3. Information we collect">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">3.1 Information you provide</h3>
            <BulletList
              items={[
                'Account information (name, business email, password, company details)',
                'Team invitations and role assignments (manager or user)',
                'Company, vehicle, inspection, and defect reporting data',
                'Optional Plant & Machinery data: machine registers, examination and service records, inspector details, photos, and generated PDF reports',
                'Support and contact messages you send us',
              ]}
            />

            <h3 className="text-lg font-semibold text-slate-900 mb-3 mt-6">3.2 Automatically collected information</h3>
            <BulletList
              items={[
                'Device and app metadata (model, OS, app version)',
                'Usage and event data required to operate features and diagnose faults',
                'Security, audit, and service logs',
                'Approximate technical identifiers needed for authentication and session security',
              ]}
            />

            <h3 className="text-lg font-semibold text-slate-900 mb-3 mt-6">3.3 Camera, photos, and notifications</h3>
            <p className="text-slate-600 leading-relaxed mb-4">We may request device permissions for:</p>
            <BulletList
              items={[
                'Taking vehicle inspection photos (including multi-photo walkaround checks)',
                'Plant & Machinery inspection photos where your company uses that module',
                'Storing inspection photos and PDF reports securely in our cloud systems',
                'Push notification tokens for operational alerts (for example defect notifications and plant examination due reminders for managers)',
              ]}
            />
          </Section>

          <Section title="4. Lawful bases and how we use information">
            <p className="text-slate-600 leading-relaxed mb-4">
              We process personal data only where we have a lawful basis under UK GDPR, including:
            </p>
            <BulletList
              items={[
                'Contract — to create accounts, provide the Service, and manage subscriptions',
                'Legitimate interests — to secure the Service, prevent abuse, improve reliability, and provide support (balanced against your rights)',
                'Legal obligation — where we must keep records for tax, accounting, or regulatory reasons',
                'Consent — where required (for example certain optional communications or non-essential cookies, if introduced later)',
              ]}
            />
            <p className="text-slate-600 leading-relaxed mt-4 mb-4">We use Firebase / Google Cloud to:</p>
            <BulletList
              items={[
                'Authenticate users and manage secure sign-in',
                'Store fleet data, optional plant records, profiles, and company data in Firestore and related storage',
                'Host data on Google Cloud infrastructure with encryption in transit and at rest',
              ]}
            />
            <p className="text-slate-600 leading-relaxed mt-4 mb-4">We use other providers to operate billing and communications:</p>
            <BulletList
              items={[
                'Stripe for subscription checkout, billing portal, payment processing, and webhook events',
                'SMTP / email providers for invites and transactional service emails',
                'Notification services for push alerts and scheduled reminders',
              ]}
            />
          </Section>

          <Section title="5. Data storage and security">
            <BulletList
              items={[
                'Data is encrypted in transit and at rest using provider controls',
                'Access is role-based within each company; staff see only what their role permits',
                'A small number of authorised Fleet Track PRO staff may have elevated platform access solely for support, security monitoring, and maintenance — restricted, logged, and subject to internal controls',
                'No security measure is perfect; you must also protect account credentials and devices',
              ]}
            />
          </Section>

          <Section title="6. International transfers">
            <p className="text-slate-600 leading-relaxed">
              Our processors (including Google / Firebase and Stripe) may process data in the UK, EEA, United
              States, or other countries. Where data is transferred outside the UK, we rely on appropriate
              safeguards such as adequacy regulations or standard contractual clauses provided by those vendors,
              as applicable.
            </p>
          </Section>

          <Section title="7. Your rights">
            <p className="text-slate-600 leading-relaxed mb-4">
              Under UK data protection law, you may have the right to:
            </p>
            <BulletList
              items={[
                'Access your personal data',
                'Request rectification of inaccurate data',
                'Request erasure (subject to legal and contractual retention needs)',
                'Restrict or object to certain processing',
                'Data portability where applicable',
                'Withdraw consent where processing is based on consent',
                'Opt out of marketing emails (transactional service emails may still be sent)',
                'Complain to the Information Commissioner’s Office (ICO) if you are unhappy with how we handle your data',
              ]}
            />
            <p className="text-slate-600 leading-relaxed mt-4">
              To exercise rights we control directly, email{' '}
              <a
                href={SUPPORT_MAILTO}
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                {SUPPORT_EMAIL}
              </a>
              . For workplace fleet records, your employer may need to action the request as controller.
            </p>
          </Section>

          <Section title="8. Subscriptions and billing data">
            <BulletList
              items={[
                'Subscriptions are sold and managed via website checkout powered by Stripe',
                'Card and payment details are handled by Stripe; we do not store full card numbers on our servers',
                'Managers can open the Stripe billing portal from the dashboard',
              ]}
            />
            <p className="text-slate-600 leading-relaxed mt-4">
              Contractual billing rules are in our{' '}
              <Link
                href="/subscription-terms"
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                Subscription Terms
              </Link>
              .
            </p>
          </Section>

          <Section title="9. Cookies and similar technologies">
            <p className="text-slate-600 leading-relaxed">
              We use essential cookies and local storage to run the website, keep sessions secure, and remember
              cookie preferences. We do not currently use third-party advertising or analytics cookies on the
              marketing site. Details are in our{' '}
              <Link href="/cookies" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Cookie Policy
              </Link>
              .
            </p>
          </Section>

          <Section title="10. Third-party services">
            <p className="text-slate-600 leading-relaxed mb-4">Key processors / service providers include:</p>
            <BulletList
              items={[
                'Firebase / Google LLC (authentication, database, storage, hosting-related services)',
                'Stripe Payments Europe Ltd / Stripe, Inc. (payments and billing)',
                'Email delivery providers (transactional messages)',
                'Apple / Google (app distribution and, where used, push notification infrastructure)',
              ]}
            />
            <p className="text-slate-600 leading-relaxed mt-4">
              Each provider processes data under its own terms and privacy notices when acting as an independent
              controller (for example Stripe for payment fraud prevention).
            </p>
          </Section>

          <Section title="11. Data retention">
            <p className="text-slate-600 leading-relaxed mb-4">
              Access periods, trials, and suspension are described in our{' '}
              <Link
                href="/subscription-terms"
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                Subscription Terms
              </Link>
              . Retention principles:
            </p>
            <BulletList
              items={[
                'Account data is retained while your user account is active',
                'Vehicle and inspection data are retained according to your company’s needs and legal obligations',
                'Where Plant & Machinery is used: LOLER-related records are kept for at least two years; service and hire-only records for at least fifteen months; machines that lift persons or require a lifetime examination scheme may be retained indefinitely while on your register',
                'Inactive individual user accounts with no sign-in for 90 consecutive days may be deleted with associated personal data where this does not conflict with an active company subscription or legal retention duties; we will give reasonable notice where practicable',
                'After company cancellation, data may remain for a reasonable period to allow reactivation, then be deleted or anonymised on request subject to legal holds',
              ]}
            />
          </Section>

          <Section title="12. How to delete your account and data">
            <p className="text-slate-600 leading-relaxed mb-4">
              You can delete your personal user account from the {SITE_NAME} mobile app:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
              <ol className="space-y-3 text-slate-600 list-decimal list-inside">
                <li>
                  Open the app and go to the <strong className="text-slate-800">Account</strong> tab
                </li>
                <li>
                  Tap <strong className="text-slate-800">Manage Account</strong>
                </li>
                <li>
                  Choose <strong className="text-slate-800">Delete Account</strong>
                </li>
                <li>Confirm deletion when prompted</li>
              </ol>
            </div>
            <p className="text-slate-600 leading-relaxed mb-3">When you delete your account:</p>
            <BulletList
              items={[
                'Your user profile, credentials, and user-level settings are permanently removed',
                'Content you created may be removed where deletion is permitted under your role, employer policies, and law',
                'Some records may be retained where the law requires (tax, investigations, security, or fraud prevention). Company-wide fleet data may remain under the company controller after your profile is deleted',
              ]}
            />
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-950 leading-relaxed">
                <strong>Important:</strong> Account deletion is permanent and cannot be undone. Export anything you
                need first. Subscription cancellation is managed through the Stripe billing portal linked from your
                dashboard (see{' '}
                <Link
                  href="/subscription-terms"
                  className="underline underline-offset-2 hover:text-amber-800"
                >
                  Subscription Terms
                </Link>
                ).
              </p>
            </div>
          </Section>

          <Section title="13. Children’s privacy">
            <p className="text-slate-600 leading-relaxed">
              {SITE_NAME} is a business service and is not aimed at children. We do not knowingly collect personal
              data from anyone under 13. If you believe we have processed such information in error, contact{' '}
              <a
                href={SUPPORT_MAILTO}
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                {SUPPORT_EMAIL}
              </a>{' '}
              and we will delete it promptly where the law allows.
            </p>
          </Section>

          <Section title="14. Changes to this policy">
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Where changes are material, we will notify you
              through the app or by email where we have your contact details. The “Last updated” date at the top
              will change when we do.
            </p>
          </Section>

          <Section title="15. Contact us">
            <BulletList
              items={[
                <>
                  Email:{' '}
                  <a
                    href={SUPPORT_MAILTO}
                    className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </>,
                <>
                  Website:{' '}
                  <a
                    href={SITE_URL}
                    className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
                  >
                    {SITE_URL}
                  </a>
                </>,
                'You may also contact the ICO (ico.org.uk) about UK data protection concerns.',
              ]}
            />
          </Section>

          <Section title="16. App store requirements">
            <p className="text-slate-600 leading-relaxed">
              Our companion app follows applicable Apple App Store and Google Play privacy and data transparency
              requirements. In-app account deletion is provided as described above.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
