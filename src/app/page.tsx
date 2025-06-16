import React from 'react';
import Navbar from './components/Navbar';
import { Wrench, QrCode, Map, Smartphone, Users, PoundSterling } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent"></div>
          <div className="absolute top-1/2 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4 pt-20 sm:pt-32 pb-12 sm:pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              Transform Your Equipment Management with
              <span className="text-primary block mt-2">Stock Track PRO</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed">
              Take control of your tools and equipment with our innovative QR-based tracking system. 
              Optimised for construction companies, workshops, and industrial facilities.
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
            Powerful Tools for Equipment Management
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <QrCode className="w-6 h-6 text-primary" />,
                title: "QR Code System",
                description: "Unique QR codes for each piece of equipment, ensuring simple and efficient tracking."
              },
              {
                icon: <Map className="w-6 h-6 text-primary" />,
                title: "Location Tracking",
                description: "Monitor equipment across multiple sites, workshops, or vehicles in real-time."
              },
              {
                icon: <Smartphone className="w-6 h-6 text-primary" />,
                title: "Mobile Access",
                description: "Manage equipment from any mobile device, ideal for on-site operations."
              },
              {
                icon: <PoundSterling className="w-6 h-6 text-primary" />,
                title: "Cost Control",
                description: "Minimise equipment loss and track maintenance costs effectively."
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

      {/* CTA Section */}
      <div className="relative bg-black py-12 sm:py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="absolute top-1/2 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Optimise Your Equipment Management?
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8">
              Experience how Stock Track PRO can revolutionise your tool and equipment tracking.
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
