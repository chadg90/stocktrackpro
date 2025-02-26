import React from 'react';
import Navbar from '../components/Navbar';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            Cookie <span className="text-primary">Policy</span>
          </h1>

          <div className="prose prose-invert max-w-none">
            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies?</h2>
              <p className="text-white/80 mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
                They are widely used to make websites work more efficiently and provide valuable information to website owners.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Cookies</h2>
              <p className="text-white/80 mb-4">
                We use cookies for the following purposes:
              </p>
              <ul className="space-y-3 text-white/80 mb-6">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Essential Cookies:</strong> Required for the website to function properly. These cannot be disabled.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors interact with our website.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span><strong className="text-white">Functional Cookies:</strong> Remember your preferences and settings.</span>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Cookie Types We Use</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Essential Cookies</h3>
                  <p className="text-white/80">Cookie consent status, session management, and security features.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Analytics Cookies</h3>
                  <p className="text-white/80">Anonymous usage statistics to help us improve our website.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Functional Cookies</h3>
                  <p className="text-white/80">Remember your preferences and settings for future visits.</p>
                </div>
              </div>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Managing Cookies</h2>
              <p className="text-white/80 mb-4">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your 
                computer and you can set most browsers to prevent them from being placed. However, if you do this, 
                you may have to manually adjust some preferences every time you visit our website and some features 
                may not work as intended.
              </p>
              <p className="text-white/80">
                To modify your cookie settings on our website, click the cookie preferences button in the footer 
                or adjust your browser settings directly.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-white/80 mb-4">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <p className="text-white/80">
                Email: support@stocktrackpro.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 