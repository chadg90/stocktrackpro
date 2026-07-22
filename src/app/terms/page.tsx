import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { SITE_LEGAL_NAME, SITE_NAME, SITE_URL, SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/brand';

/** Update only when the terms text changes. */
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

export default function Terms() {
  return (
    <div className="marketing-shell">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Terms and <span className="text-[var(--brand-blue)]">Conditions</span>
          </h1>
          <p className="text-slate-500 mb-8">Last updated: {LAST_UPDATED}</p>

          <Section title="Introduction">
            <p className="text-slate-600 leading-relaxed mb-4">
              These Terms and Conditions (&quot;Terms&quot;) govern your use of the {SITE_NAME} website, web dashboard,
              companion mobile app, and related services (together, the &quot;Service&quot;) operated by {SITE_LEGAL_NAME}{' '}
              (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;).
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Please read them together with our{' '}
              <Link href="/privacy" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2">
                Privacy Policy
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
              . By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the
              Service.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Billing, trials, renewal, and cancellation are governed primarily by the Subscription Terms. If there
              is a conflict on those topics, the Subscription Terms take priority.
            </p>
          </Section>

          <Section title="1. Eligibility and business use">
            <BulletList
              items={[
                'You must be at least 18 years old and have legal capacity to enter a binding agreement.',
                'The Service is sold for business use. It is not intended for consumers.',
                'If you use the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms. In that case, “you” includes the organisation.',
              ]}
            />
          </Section>

          <Section title="2. Service description">
            <p className="text-slate-600 leading-relaxed mb-4">
              {SITE_NAME} is a fleet inspection and compliance software platform that may include:
            </p>
            <BulletList
              items={[
                'Visibility of fleet vehicle status, inspections, and defects within the platform',
                'Vehicle inspections with photo documentation',
                'Defect reporting, notifications, and repair workflows',
                'MOT and tax renewal reminders where configured',
                'Mobile app access for drivers, fitters, and field staff',
                'Audit trails and history for operational records',
                'Role-based access (manager or user — fitters are typically assigned the manager role)',
                'Optional Plant & Machinery records (LOLER, service, hire checks, and related PDFs) where subscribed',
              ]}
            />
            <p className="text-slate-600 leading-relaxed mt-4">
              The Service is a software tool to help you record and manage operational information. It does{' '}
              <strong className="text-slate-800">not</strong> replace professional advice and does{' '}
              <strong className="text-slate-800">not</strong> guarantee DVSA, MOT, LOLER, HSE, or any other regulatory
              outcome. You remain solely responsible for vehicle roadworthiness, plant safety, compliance with
              applicable law, and the accuracy of information your users submit.
            </p>
          </Section>

          <Section title="3. Accounts and security">
            <BulletList
              items={[
                'You must provide accurate and complete registration information and keep it up to date.',
                'You are responsible for safeguarding credentials and for all activity under your accounts, including actions by team members you invite.',
                'Notify us promptly at ' + SUPPORT_EMAIL + ' if you suspect unauthorised access.',
                'We may suspend or restrict accounts that we reasonably believe are compromised, abusive, or used in breach of these Terms.',
                'Managers of a company account are responsible for managing team access, roles, and removals.',
              ]}
            />
          </Section>

          <Section title="4. Customer content and responsibilities">
            <BulletList
              items={[
                'You retain ownership of content you and your users submit (including photos, inspection answers, defect details, and plant records) (“Customer Content”).',
                'You grant us a limited licence to host, process, display, and back up Customer Content solely to provide and improve the Service, provide support, and meet legal obligations.',
                'You warrant that you have the rights needed to submit Customer Content and that it does not infringe third-party rights or applicable law.',
                'You are responsible for configuring the Service appropriately for your organisation and for decisions made using information in the Service.',
              ]}
            />
          </Section>

          <Section title="5. Subscriptions and payments">
            <p className="text-slate-600 leading-relaxed">
              Paid access is provided on a subscription basis. Prices are shown on our Pricing page in GBP and
              typically include UK VAT as stated there. Subscriptions are purchased through website checkout
              (Stripe) and are not sold or renewed through the mobile app. Full rules on trials, billing cycles,
              quantity changes, cancellation, and refunds are in our{' '}
              <Link
                href="/subscription-terms"
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                Subscription Terms
              </Link>
              .
            </p>
          </Section>

          <Section title="6. Acceptable use">
            <p className="text-slate-600 leading-relaxed mb-4">
              You agree to use the Service only for legitimate business fleet and plant management purposes.
              You must not:
            </p>
            <BulletList
              items={[
                'Share credentials with unauthorised persons or allow access outside your organisation’s authorised users',
                'Use the Service for unlawful monitoring, harassment, or any illegal purpose',
                'Submit false, misleading, or fraudulent inspection, defect, or plant records',
                'Attempt to reverse engineer, copy, scrape, overload, or disrupt the Service',
                'Interfere with security, access controls, or other customers’ data',
                'Resell, sublicense, or provide the Service to third parties as a bureau service without our prior written consent',
                'Upload malware or content that is defamatory, discriminatory, or otherwise unlawful',
              ]}
            />
          </Section>

          <Section title="7. Intellectual property">
            <p className="text-slate-600 leading-relaxed">
              The Service — including software, design, logos, documentation, and branding — is owned by{' '}
              {SITE_LEGAL_NAME} or its licensors and protected by intellectual property laws. Except for the limited
              right to use the Service under these Terms, no rights are granted. You may not copy, modify, create
              derivative works from, or commercially exploit our IP without our prior written permission.
            </p>
          </Section>

          <Section title="8. Confidentiality">
            <p className="text-slate-600 leading-relaxed">
              Each party must keep the other party’s confidential business information confidential and use it only
              to perform obligations under these Terms, except where disclosure is required by law or the information
              is already public through no fault of the receiving party. Customer Content is handled as described in
              our Privacy Policy and these Terms.
            </p>
          </Section>

          <Section title="9. Disclaimer of warranties">
            <p className="text-slate-600 leading-relaxed mb-4">
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis to the fullest extent permitted by law.
              We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components, or
              that it will meet your particular compliance or operational requirements.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence,
              fraud or fraudulent misrepresentation, or any other liability that cannot be excluded under English
              law.
            </p>
          </Section>

          <Section title="10. Limitation of liability">
            <BulletList
              items={[
                'We are not liable for loss of profits, revenue, goodwill, business opportunity, anticipated savings, or any indirect or consequential loss, whether arising in contract, tort (including negligence), or otherwise.',
                'We are not liable for losses arising from: system downtime or third-party outages; inaccurate, incomplete, or delayed Customer Content; misuse of the Service; your failure to maintain roadworthy vehicles or safe plant; or regulatory action against you.',
                'Subject to the non-excludable liabilities above, our total aggregate liability arising out of or in connection with the Service in any 12-month period is limited to the fees you paid us for the Service in that same 12-month period.',
              ]}
            />
          </Section>

          <Section title="11. Indemnity">
            <p className="text-slate-600 leading-relaxed">
              You agree to indemnify and hold us harmless from claims, losses, and reasonable costs (including legal
              fees) arising from: (a) your Customer Content; (b) your breach of these Terms; (c) your unlawful use of
              the Service; or (d) claims by your employees, contractors, or regulators relating to how you operate
              your fleet or plant, except to the extent caused by our wilful misconduct.
            </p>
          </Section>

          <Section title="12. Suspension and termination">
            <BulletList
              items={[
                'You may stop using the Service at any time. Paid subscriptions end according to the Subscription Terms.',
                'We may suspend or terminate access immediately if you materially breach these Terms, fail to pay, misuse the Service, or create a security or legal risk.',
                'On termination, your licence to use the Service ends. Data retention and deletion are described in the Subscription Terms and Privacy Policy.',
              ]}
            />
          </Section>

          <Section title="13. Changes to these Terms">
            <p className="text-slate-600 leading-relaxed">
              We may update these Terms from time to time. Material changes will be communicated by email or a notice
              in the dashboard where practicable. Continued use after the effective date constitutes acceptance,
              except where applicable law requires otherwise. If you do not agree, you must stop using the Service
              and cancel any subscription under the Subscription Terms.
            </p>
          </Section>

          <Section title="14. Governing law">
            <p className="text-slate-600 leading-relaxed">
              These Terms are governed by the laws of England and Wales. The courts of England and Wales have
              exclusive jurisdiction over disputes arising from them, without prejudice to any mandatory rights you
              may have under applicable law.
            </p>
          </Section>

          <Section title="15. Contact">
            <p className="text-slate-600 leading-relaxed mb-4">
              Questions about these Terms: {' '}
              <a
                href={SUPPORT_MAILTO}
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
            <p className="text-slate-600 leading-relaxed">
              Website:{' '}
              <a
                href={SITE_URL}
                className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
              >
                {SITE_URL}
              </a>
            </p>
          </Section>

          <p className="text-sm text-slate-500 leading-relaxed">
            By using {SITE_NAME}, you acknowledge that you have read and agree to these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
