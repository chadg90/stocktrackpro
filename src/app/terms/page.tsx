'use client';

import React from 'react';
import Navbar from '../components/Navbar';

export default function Terms() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-white mb-8">Terms and Conditions</h1>
            <p className="text-zinc-400 mb-4">Last Updated: February 4, 2024</p>

            <p className="text-zinc-300 mb-8">
              Welcome to Stock Track PRO ("we," "our," "us"). These Terms and Conditions govern your use of our website, 
              tool management application, and services. By accessing or using our website, application, or services, 
              you agree to be bound by these Terms and Conditions.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-300 mb-4">
              By using Stock Track PRO, you confirm that you are at least 18 years old or have the legal capacity to 
              enter into a binding agreement. If you are using our services on behalf of an organization, you represent 
              that you have the authority to bind that organization to these terms.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Service Description</h2>
            <p className="text-zinc-300 mb-4">
              Stock Track PRO is a tool management solution that provides:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 mb-4">
              <li>Real-time tool tracking using QR codes</li>
              <li>Tool condition monitoring</li>
              <li>Location tracking</li>
              <li>Mobile app access</li>
              <li>Full history tracking</li>
              <li>Manager controls</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. User Accounts and Security</h2>
            <p className="text-zinc-300 mb-4">
              When you create an account with Stock Track PRO, you must provide accurate and complete information. 
              You are responsible for maintaining the security of your account credentials and for all activities 
              that occur under your account.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Subscription and Payments</h2>
            <p className="text-zinc-300 mb-4">
              Our services are provided on a subscription basis. Prices are clearly displayed on our pricing page 
              and may be subject to VAT. All prices are in British Pounds (GBP). Subscriptions are billed monthly 
              based on the number of users.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Data Privacy and Security</h2>
            <p className="text-zinc-300 mb-4">
              We take the security of your data seriously. All tool tracking data, user information, and usage 
              statistics are stored securely and handled in accordance with our Privacy Policy and applicable 
              data protection laws.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Acceptable Use</h2>
            <p className="text-zinc-300 mb-4">
              You agree to use Stock Track PRO only for legitimate tool management purposes. Prohibited activities include:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 mb-4">
              <li>Attempting to bypass or manipulate our QR code system</li>
              <li>Sharing account credentials with unauthorized users</li>
              <li>Using the service to track items other than tools and equipment</li>
              <li>Attempting to reverse engineer or copy our system</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Intellectual Property</h2>
            <p className="text-zinc-300 mb-4">
              The Stock Track PRO application, including its code, design, logos, and content, is protected by 
              intellectual property laws. You may not copy, modify, or create derivative works without our 
              express permission.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-zinc-300 mb-4">
              While we strive to provide accurate tool tracking and management services, we cannot guarantee 
              100% accuracy at all times. We are not liable for any losses resulting from system downtime, 
              data inaccuracies, or misuse of the system.
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
              <li>Email: support@stocktrackpro.co.uk</li>
              <li>Website: www.stocktrackpro.co.uk</li>
            </ul>

            <p className="text-zinc-400 mt-12 mb-8">
              By using Stock Track PRO, you acknowledge that you have read, understood, and agree to these 
              Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 