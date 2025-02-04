import React from 'react';
import Navbar from './components/Navbar';
import { Wrench, QrCode, Map, Smartphone, Users, PoundSterling } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Effortless Tool Management with
            <span className="text-zinc-300 block mt-2">Stock Track PRO</span>
          </h1>
          <p className="text-xl text-zinc-300 mb-8">
            Track and manage your tools with ease using QR codes. Know where your tools are, 
            who has them, and what condition they are in - all in one simple app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-zinc-600 text-white rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-zinc-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Simple and Effective Tool Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-zinc-700/50 p-6 rounded-lg border border-zinc-600 hover:bg-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-zinc-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">QR Code Scanning</h3>
              <p className="text-zinc-300">
                Quickly check out tools by scanning their unique QR code with your phone.
              </p>
            </div>
            <div className="bg-zinc-700/50 p-6 rounded-lg border border-zinc-600 hover:bg-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <Map className="w-6 h-6 text-zinc-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Tool Tracking</h3>
              <p className="text-zinc-300">
                Know exactly where your tools are and who has them at all times.
              </p>
            </div>
            <div className="bg-zinc-700/50 p-6 rounded-lg border border-zinc-600 hover:bg-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-zinc-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mobile App</h3>
              <p className="text-zinc-300">
                Easy-to-use mobile app for iOS and Android devices.
              </p>
            </div>
            <div className="bg-zinc-700/50 p-6 rounded-lg border border-zinc-600 hover:bg-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
                <PoundSterling className="w-6 h-6 text-zinc-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cost Savings</h3>
              <p className="text-zinc-300">
                Reduce costs from lost tools and track maintenance needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
