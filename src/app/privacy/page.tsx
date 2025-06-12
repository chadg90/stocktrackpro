import React from 'react';
import Navbar from '../components/Navbar';

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-white/80 mb-8">Last Updated: {currentDate}</p>

          <div className="prose prose-invert max-w-none">
            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-white/80">
                StockTrackPro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your information when you use our mobile application.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">2.1 Information You Provide</h3>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Account information (email, name, company details)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>User profile information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Company and tool management data</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">2.2 Automatically Collected Information</h3>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Device information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Usage data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Log data</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">2.3 Camera Access</h3>
              <p className="text-white/80 mb-4">We request access to your device's camera for:</p>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Scanning QR codes for tool management</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>This access is only used when you actively choose to scan a QR code</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>No photos or videos are stored or transmitted</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>

              <h3 className="text-xl font-semibold text-white mb-3">3.1 Firebase Services</h3>
              <p className="text-white/80 mb-4">We use Firebase for:</p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Authentication: Managing user accounts and secure sign-in</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Firestore: Storing and managing tool inventory, user profiles, and company data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>All data is stored securely on Google Cloud Infrastructure</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">3.2 RevenueCat</h3>
              <p className="text-white/80 mb-4">We use RevenueCat to manage subscriptions:</p>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Processing subscription purchases</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Managing subscription status</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Handling subscription renewals and cancellations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Transaction data is processed securely through Apple's App Store</span>
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
                  <span>Subscriptions are managed through your Apple App Store account</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Billing and payment information is handled by Apple</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>You can view and manage subscriptions in your App Store settings</span>
                </li>
              </ul>
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
                  <span>RevenueCat</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Apple App Store</span>
                </li>
              </ul>
              <p className="text-white/80">Each service has its own privacy policy that applies to your data.</p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Data Retention</h2>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Account data is retained while your account is active</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Tool and inventory data is retained per company requirements</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>You can request deletion of your data by contacting us</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
              <p className="text-white/80">
                Our service is not intended for and does not target children under 13. We do not knowingly collect information from children under 13.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to Privacy Policy</h2>
              <p className="text-white/80">
                We may update this Privacy Policy periodically. We will notify you of any material changes through the app or via email.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
              <p className="text-white/80 mb-4">If you have questions about this Privacy Policy, please contact us at:</p>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Email: support@stocktrackpro.co.uk</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Website: https://www.stocktrackpro.co.uk</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. App Store Requirements</h2>
              <p className="text-white/80">
                This app is distributed through the Apple App Store and follows all Apple's privacy and data collection guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 