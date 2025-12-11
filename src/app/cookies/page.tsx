import React from 'react';
import Navbar from '../components/Navbar';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            Cookie <span className="text-primary">Policy</span>
          </h1>
          <p className="text-white/80 mb-8">Last Updated: 11 December 2025</p>

          <div className="space-y-8">
            <div className="bg-black border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-3">What Are Cookies?</h2>
              <p className="text-white/80 leading-relaxed">
                Cookies are small text files stored on your device to help the website function and improve your experience.
              </p>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-3">Types of Cookies We Use</h2>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-primary"></span>
                  <div>
                    <p className="text-white font-semibold">Essential Cookies</p>
                    <p>Required for basic website functionality.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-primary"></span>
                  <div>
                    <p className="text-white font-semibold">Analytics Cookies</p>
                    <p>Used to analyse site traffic and improve performance.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-primary"></span>
                  <div>
                    <p className="text-white font-semibold">Preference Cookies</p>
                    <p>Remember user settings such as display preferences.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-black border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-3">Managing Cookies</h2>
              <p className="text-white/80 leading-relaxed mb-3">
                You can disable cookies in your browser settings at any time. Doing so may impact website functionality.
              </p>
              <p className="text-white/80 leading-relaxed">
                For questions, contact <a href="mailto:support@stocktrackpro.co.uk" className="text-primary hover:text-primary-light">support@stocktrackpro.co.uk</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

