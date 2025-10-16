import React from 'react';
import Navbar from './components/Navbar';
import { Wrench, QrCode, Map, Smartphone, Users, PoundSterling, Download } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 sm:pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent"></div>
          <div className="absolute top-1/2 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4 pb-12 sm:pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              Transform Your Asset, Equipment & Fleet Management with
              <span className="text-primary block mt-2">Stock Track PRO</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed">
              Take control of your assets, equipment, and vehicle fleet with our comprehensive QR-based tracking system. 
              Perfect for any business that needs to track valuable resources efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-primary text-white rounded-lg bg-primary hover:bg-primary-light transition-colors text-sm sm:text-base"
              >
                Book a Demo
              </Link>
              <Link
                href="/benefits"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-primary/20 text-white rounded-lg hover:border-primary/50 transition-colors text-sm sm:text-base"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-black py-12 sm:py-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-12 text-center">
            Powerful Features for Asset, Equipment & Fleet Management
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <QrCode className="w-6 h-6 text-primary" />,
                title: "QR Code System",
                description: "Unique QR codes for each asset and vehicle, ensuring simple and efficient tracking."
              },
              {
                icon: <Map className="w-6 h-6 text-primary" />,
                title: "Location Tracking",
                description: "Monitor assets and vehicles across multiple sites in real-time."
              },
              {
                icon: <Smartphone className="w-6 h-6 text-primary" />,
                title: "Mobile Access",
                description: "Manage assets and perform vehicle inspections from any mobile device."
              },
              {
                icon: <PoundSterling className="w-6 h-6 text-primary" />,
                title: "Cost Control",
                description: "Minimise asset loss and track maintenance costs effectively."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-black p-6 sm:p-8 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-white/80">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="relative bg-black py-12 sm:py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="absolute top-1/2 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Download <span className="text-primary">Stock Track PRO</span>
              </h2>
            </div>
            <p className="text-base sm:text-lg text-white/80 mb-8">
              Get started with our Android app today. Version 1.0.4 - 127 MB
            </p>
            
            <div className="bg-black border border-primary/20 rounded-2xl p-6 sm:p-8 mb-8">
              <a
                href="https://github.com/chadg90/StockTrackPro-Releases/releases/download/v1.0.4/app-release.apk"
                download="StockTrackPro.apk"
                className="inline-flex items-center px-8 py-4 text-white bg-primary hover:bg-primary-light rounded-lg transition-colors text-lg font-semibold mb-6"
              >
                <Download className="w-5 h-5 mr-2" />
                📱 Download Android APK
              </a>
              
              <div className="text-left max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Installation Instructions:</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Download the APK file above</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Enable "Install unknown apps" in Android settings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Tap the downloaded APK to install</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Launch Stock Track PRO and start tracking!</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-black py-12 sm:py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="absolute top-1/2 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Optimise Your Asset, Equipment & Fleet Management?
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8">
              Experience how Stock Track PRO can revolutionise your asset, equipment, and fleet tracking.
              Book a personalised demo today.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-white bg-primary hover:bg-primary-light rounded-lg transition-colors text-sm sm:text-base"
            >
              Book Your Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
