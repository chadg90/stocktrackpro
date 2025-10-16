import React from 'react';
import Navbar from '../components/Navbar';
import { Download, Smartphone, Shield, CheckCircle, ArrowRight } from 'lucide-react';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">
            Download <span className="text-primary">Stock Track PRO</span>
          </h1>
          <p className="text-xl text-white/80 mb-12">
            Get the Stock Track PRO Android app and start managing your assets, equipment, and fleet today.
          </p>

          {/* Download Section */}
          <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Android APK Download</h2>
              <p className="text-white/80 mb-6">
                Version 1.0.4 - 127 MB
              </p>
              
              <a
                href="https://github.com/chadg90/StockTrackPro-Releases/releases/download/v1.0.4/app-release.apk"
                download="StockTrackPro.apk"
                className="inline-flex items-center px-8 py-4 text-white bg-primary hover:bg-primary-light rounded-lg transition-colors text-lg font-semibold mb-8"
              >
                <Download className="w-5 h-5 mr-2" />
                📱 Download Android APK
              </a>
            </div>

            {/* Installation Instructions */}
            <div className="bg-primary/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Installation Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-4 mt-0.5">1</span>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Download the APK</h4>
                      <p className="text-white/80 text-sm">Click the download button above to get the APK file</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-4 mt-0.5">2</span>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Enable Unknown Sources</h4>
                      <p className="text-white/80 text-sm">Go to Settings > Security > Install unknown apps and enable for your browser</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-4 mt-0.5">3</span>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Install the App</h4>
                      <p className="text-white/80 text-sm">Tap the downloaded APK file to begin installation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-4 mt-0.5">4</span>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Launch & Start</h4>
                      <p className="text-white/80 text-sm">Open Stock Track PRO and begin tracking your assets and fleet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black border border-primary/20 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Mobile Optimised</h3>
              <p className="text-white/80 text-sm">Designed specifically for mobile devices with intuitive touch controls</p>
            </div>
            
            <div className="bg-black border border-primary/20 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure & Reliable</h3>
              <p className="text-white/80 text-sm">Enterprise-grade security with Firebase authentication and encrypted data</p>
            </div>
            
            <div className="bg-black border border-primary/20 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Easy Setup</h3>
              <p className="text-white/80 text-sm">Quick installation and setup process to get you started immediately</p>
            </div>
          </div>

          {/* System Requirements */}
          <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">System Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Android Requirements</h4>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>Android 6.0 (API level 23) or higher</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>Minimum 2GB RAM</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>150MB available storage space</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>Camera for QR code scanning</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Permissions Required</h4>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>Camera - For QR code scanning and vehicle inspections</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>Storage - For saving inspection photos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>Internet - For data synchronisation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>Notifications - For important alerts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-primary/5 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-white/80 mb-6">
              Download Stock Track PRO now and transform how you manage your assets, equipment, and fleet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/chadg90/StockTrackPro-Releases/releases/download/v1.0.4/app-release.apk"
                download="StockTrackPro.apk"
                className="inline-flex items-center px-6 py-3 text-white bg-primary hover:bg-primary-light rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Now
              </a>
              <a
                href="/how-to"
                className="inline-flex items-center px-6 py-3 border border-primary/20 hover:border-primary/50 text-white rounded-lg transition-colors"
              >
                View How To Guide
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
