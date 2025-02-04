import React from 'react';
import Navbar from '../components/Navbar';
import { Shield, Smartphone, Lock, PoundSterling, Settings, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function Benefits() {
  const benefits = [
    {
      icon: <Shield className="w-6 h-6 text-zinc-300" />,
      title: "Smart Tool Management",
      description: "Track tools in real-time with QR codes and get instant updates on tool location and status."
    },
    {
      icon: <PoundSterling className="w-6 h-6 text-zinc-300" />,
      title: "Cost Reduction",
      description: "Save money by reducing lost tools and better managing tool maintenance and repairs."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-zinc-300" />,
      title: "Mobile App",
      description: "User-friendly mobile app for iOS and Android devices."
    },
    {
      icon: <Lock className="w-6 h-6 text-zinc-300" />,
      title: "Enterprise-Grade Security",
      description: "Keep your data safe with advanced encryption and secure authentication."
    },
    {
      icon: <Settings className="w-6 h-6 text-zinc-300" />,
      title: "Manager Controls",
      description: "Complete control over users, tools, locations, and access to full history tracking."
    },
    {
      icon: <FileCheck className="w-6 h-6 text-zinc-300" />,
      title: "Maintenance Tracking",
      description: "Keep track of tool conditions and schedule maintenance to prevent costly repairs."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-6">
            Why Choose Stock Track PRO?
          </h1>
          <p className="text-xl text-zinc-300">
            Discover how our mobile tool management solution can transform your workflow,
            reduce costs, and boost productivity.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-zinc-800 p-6 rounded-lg border border-zinc-600 hover:bg-zinc-700/80 transition-colors"
            >
              <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-zinc-300">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-zinc-600 text-white rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
} 