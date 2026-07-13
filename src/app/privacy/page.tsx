import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

/** Update only when the policy text changes (avoid misleading “daily” updates). */
const LAST_UPDATED = '2 June 2026';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-white/80 mb-8">Last updated: {LAST_UPDATED}</p>

          <div className="prose prose-invert max-w-none">
            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-white/80">
                Fleet Track PRO Ltd (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) trades as <strong className="text-white">Fleet Track PRO</strong>. We are committed to protecting your privacy. This policy explains what personal data we collect, why we collect it, how we use it, and your rights when using our website, dashboard, and companion mobile app.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">2.1 Information You Provide</h3>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Account information (name, business email, password, company details)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Team invitations and role assignments (manager or user)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Company, vehicle, inspection, and defect reporting data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>
                    Optional Plant &amp; Machinery data: machine registers, thorough examination and service
                    inspection records, inspector details, photos, and generated PDF reports
                  </span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">2.2 Automatically Collected Information</h3>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Device and app metadata (model, OS, app version)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Usage and event data required to operate features</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Security, audit, and service logs</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">2.3 Camera, Photos, and Notifications</h3>
              <p className="text-white/80 mb-4">We request access to your device&apos;s camera for:</p>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Taking vehicle inspection photos (6 photos per inspection)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Plant &amp; Machinery inspection photos where your company uses that module</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Inspection photos and PDF reports are stored securely in our cloud system</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>
                    Push notification tokens to deliver operational alerts (for example, defect notifications and,
                    for managers, plant examination due reminders)
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>

              <h3 className="text-xl font-semibold text-white mb-3">3.1 Core Platform Services</h3>
              <p className="text-white/80 mb-4">We use Firebase for:</p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Authentication: Managing user accounts and secure sign-in</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>
                    Firestore: Storing and managing vehicle fleet data, optional plant machinery records, user
                    profiles, and company data
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>All data is stored securely on Google Cloud Infrastructure</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">3.2 Billing, Email, and Notifications</h3>
              <p className="text-white/80 mb-4">We use third-party providers to operate billing and communications:</p>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>
                    Stripe for fleet and Plant &amp; Machinery subscription checkout, billing portal, payment
                    processing, and webhook events
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>SMTP/email provider for invite and service emails</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Notification services for push alerts and scheduled compliance reminders</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>All data is encrypted in transit and at rest</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>We follow industry best practices for data security</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>We regularly review and update our security practices</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Platform access: a small number of authorised Fleet Track PRO staff hold elevated platform-level access to customer data solely for the purposes of technical support, security monitoring, and service maintenance. This access is restricted, logged, and subject to internal security controls.</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
              <p className="text-white/80 mb-4">You have the right to:</p>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Access your personal data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Request corrections to your data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Request deletion of your data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Opt-out of marketing communications</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Subscription Management</h2>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Subscriptions are sold and managed via our website checkout powered by Stripe</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Billing and payment information is handled by Stripe and your selected payment method provider</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>You can view and manage subscription details in the billing portal from your dashboard</span>
                </li>
              </ul>
              <p className="text-white/80 mt-4">
                For billing-specific contractual terms, see our{' '}
                <Link href="/subscription-terms" className="text-primary hover:underline">
                  Subscription Terms
                </Link>.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Third-Party Services</h2>
              <p className="text-white/80 mb-4">We use the following third-party services:</p>
              <ul className="space-y-3 text-white/80 mb-4">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Firebase (Google LLC)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Stripe Payments Europe Ltd / Stripe, Inc.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Email delivery provider (for transactional messages)</span>
                </li>
              </ul>
              <p className="text-white/80">Each service has its own privacy policy that applies to your data.</p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Data Retention</h2>
              <p className="text-white/80 mb-4">
                How long you can access the service, trial periods, billing changes and suspension are described in our{' '}
                <Link href="/subscription-terms" className="text-primary hover:underline">
                  Subscription Terms
                </Link>
                . Company fleet records may be kept for operational and legal reasons while your organisation remains a customer or where the law requires.
              </p>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Account data is retained whilst your user account is active.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Vehicle and inspection data are retained according to your company&apos;s needs and applicable legal obligations.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>
                    Where your company uses Plant &amp; Machinery, LOLER-related records are kept for at least two
                    years; service and hire-only records for at least fifteen months; machines that lift persons or
                    require a lifetime examination scheme may be retained indefinitely whilst the machine remains on
                    your register.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>
                    Individual user accounts with no sign-in activity for 90 consecutive days may be deleted together with associated personal data, where this does not conflict with an active company subscription or legal retention duties. Where practicable, we will give reasonable advance notice.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>You may delete your own user account using the in-app account deletion feature described below.</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. How to Delete Your Account and Data</h2>
              <p className="text-white/80 mb-4">
                You have control over your personal account and can delete your user account from the Fleet Track PRO mobile app:
              </p>
              
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">Account Deletion Steps:</h3>
                <ol className="space-y-3 text-white/80">
                  <li className="flex items-start space-x-3">
                    <span className="text-primary font-semibold">1.</span>
                    <span>Open the Fleet Track PRO app and go to the <strong className="text-white">Account</strong> tab</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary font-semibold">2.</span>
                    <span>Tap on <strong className="text-white">&quot;Manage Account&quot;</strong></span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary font-semibold">3.</span>
                    <span>When the alert appears asking &quot;Choose an action&quot;, tap <strong className="text-white">&quot;Delete Account&quot;</strong></span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary font-semibold">4.</span>
                    <span>Confirm your decision by tapping <strong className="text-white">&quot;Delete&quot;</strong> in the confirmation alert</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary font-semibold">5.</span>
                    <span>Your account profile and access credentials are permanently deleted</span>
                  </li>
                </ol>
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">What Gets Deleted:</h3>
              <p className="text-white/80 mb-3">When you delete your account, the following data is permanently removed:</p>
              <ul className="space-y-3 text-white/80 mb-4">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Your user profile, credentials and user-level settings.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Content you created where deletion is permitted under your role, your employer&apos;s policies and applicable law.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>
                    Some records may be retained where the law requires (for example tax, regulatory investigations, security or fraud prevention). Company-wide fleet data may remain under the controller&apos;s account after your user profile is deleted.
                  </span>
                </li>
              </ul>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-200/90 text-sm">
                  <strong className="text-yellow-100">Important:</strong> Account deletion is permanent and cannot be undone. Export any data you wish to keep before proceeding. Subscription cancellation and billing are managed through the Stripe billing portal linked from your dashboard (see our{' '}
                  <Link href="/subscription-terms" className="text-yellow-100 underline underline-offset-2 hover:no-underline">
                    Subscription Terms
                  </Link>
                  ).
                </p>
              </div>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-white/80 mb-4">
                Fleet Track PRO is a business service and is not aimed at children. We do not knowingly collect personal data from anyone under 13. If you believe we have processed such information in error, please contact us at{' '}
                <a href="mailto:help@fleettrackpro.co.uk" className="text-primary hover:underline">
                  help@fleettrackpro.co.uk
                </a>{' '}
                and we will delete it promptly where the law allows. Further safeguards apply to children&apos;s data under UK data protection law; seek advice if your organisation processes data about children.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Privacy Policy</h2>
              <p className="text-white/80">
                We may update this Privacy Policy from time to time. Where changes are material, we will notify you through the app or by email where we have your contact details.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
              <p className="text-white/80 mb-4">If you have questions about this Privacy Policy, please contact us at:</p>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Email: help@fleettrackpro.co.uk</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Website: https://www.fleettrackpro.co.uk</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">13. App Store Requirements</h2>
              <p className="text-white/80">
                Our companion app follows applicable app store privacy and data transparency requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 