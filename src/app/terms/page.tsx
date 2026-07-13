import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

/** Update only when the terms text changes. */
const LAST_UPDATED = '12 May 2026';

export default function Terms() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-white mb-8">Terms and Conditions</h1>
            <p className="text-zinc-400 mb-4">Last updated: {LAST_UPDATED}</p>

            <p className="text-zinc-300 mb-8">
              Welcome to Fleet Track PRO (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;). These Terms and Conditions govern your use of our website,
              fleet management application and related services. Please read them together with our{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/subscription-terms" className="text-blue-400 hover:text-blue-300">
                Subscription Terms
              </Link>
              . By accessing or using our website, application or services, you agree to be bound by these Terms and Conditions.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-300 mb-4">
              By using Fleet Track PRO, you confirm that you are at least 18 years old or have the legal capacity to
              enter into a binding agreement. If you are using our services on behalf of an organisation, you represent
              that you have the authority to bind that organisation to these terms.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Service Description</h2>
            <p className="text-zinc-300 mb-4">
              Fleet Track PRO is a fleet inspection and compliance platform that provides:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 mb-4">
              <li>Visibility of fleet vehicle status, inspections and defects within the platform</li>
              <li>Vehicle inspections with photo documentation</li>
              <li>Defect reporting, notifications and repair workflows for fleet compliance</li>
              <li>MOT and tax renewal reminders where configured</li>
              <li>Mobile app access for drivers, fitters, and field staff</li>
              <li>Audit trails and history for compliance records</li>
              <li>Role-based access (manager or user — fitters are assigned the manager role)</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. User Accounts and Security</h2>
            <p className="text-zinc-300 mb-4">
              When you create an account with Fleet Track PRO, you must provide accurate and complete information.
              You are responsible for maintaining the security of your account credentials and for all activities
              that occur under your account.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Subscription and Payments</h2>
            <p className="text-zinc-300 mb-4">
              Our services are provided on a subscription basis. Prices are clearly displayed on our pricing page
              and may be subject to VAT. All prices are in British pounds (GBP). Subscriptions are billed monthly or annually
              based on subscribed vehicles. The standard plan is priced per vehicle with a minimum vehicle count.
              Paid subscriptions are purchased through our website checkout (Stripe); they are not sold or renewed through the mobile app.
              Billing, trials, renewal and cancellation are explained in our{' '}
              <Link href="/subscription-terms" className="text-blue-400 hover:text-blue-300">
                Subscription Terms
              </Link>
              .
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Data Privacy and Security</h2>
            <p className="text-zinc-300 mb-4">
              We take the security of your data seriously. Fleet inspection data, vehicle photos,
              user information and usage statistics are stored securely and handled in accordance with our{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>{' '}
              and applicable data protection laws.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Acceptable Use</h2>
            <p className="text-zinc-300 mb-4">
              You agree to use Fleet Track PRO only for legitimate fleet management and compliance purposes. Prohibited activities include:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 mb-4">
              <li>Sharing account credentials with unauthorised users</li>
              <li>Using the service for unlawful or unauthorised monitoring activities</li>
              <li>Submitting false or misleading vehicle inspection reports</li>
              <li>Attempting to reverse engineer or copy our system</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Intellectual Property</h2>
            <p className="text-zinc-300 mb-4">
              The Fleet Track PRO application, including its code, design, logos and content, is protected by
              intellectual property laws. You may not copy, modify or create derivative works without our
              express permission.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-zinc-300 mb-4">
              Whilst we strive to provide accurate fleet inspection and compliance services, we cannot guarantee
              100% accuracy at all times. We are not liable for any losses resulting from system downtime,
              data inaccuracies or misuse of the system.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Governing Law</h2>
            <p className="text-zinc-300 mb-4">
              These Terms and Conditions are governed by the laws of the United Kingdom. Any disputes shall
              be resolved in the courts of England and Wales.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Contact Information</h2>
            <p className="text-zinc-300 mb-4">
              For any questions about these Terms and Conditions, please contact us at:
            </p>
            <ul className="list-none text-zinc-300 mb-8">
              <li>Email: help@fleettrackpro.co.uk</li>
              <li>
                Website:{' '}
                <a href="https://www.fleettrackpro.co.uk" className="text-blue-400 hover:text-blue-300">
                  https://www.fleettrackpro.co.uk
                </a>
              </li>
            </ul>

            <p className="text-zinc-400 mt-12 mb-8">
              By using Fleet Track PRO, you acknowledge that you have read, understood and agree to these
              Terms and Conditions.
            </p>
            <p className="text-zinc-400 mb-8">
              Detailed billing and renewal rules are set out in our{' '}
              <Link href="/subscription-terms" className="text-blue-400 hover:text-blue-300">
                Subscription Terms
              </Link>
              . How we process personal data is described in our{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
