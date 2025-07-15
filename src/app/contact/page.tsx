'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function Contact() {
  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "Sales Inquiries",
      description: "For pricing and demo requests",
      email: "sales@stocktrackpro.co.uk",
      actionText: "Email Sales Team"
    },
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "Support",
      description: "For technical support and help",
      email: "support@stocktrackpro.co.uk",
      actionText: "Email Support"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Have questions about Stock Track PRO? We're here to help!
              Our team is ready to assist you with any inquiries about our tool management solution.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <div 
                key={index}
                className="bg-black border border-primary/20 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{method.title}</h3>
                    <p className="text-white/60">{method.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-white break-all">{method.email}</div>
                </div>

                <Link
                  href={`mailto:${method.email}`}
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
                >
                  {method.actionText}
                </Link>
              </div>
            ))}
          </div>

          {/* Response Time Info */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-black border border-primary/20 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">What to Expect</h3>
              <ul className="space-y-4 text-white/80">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>We aim to respond to all inquiries within 24 hours during business days</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>For urgent matters, please mention "Urgent" in your email subject</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                  <span>Business hours: Monday-Friday, 9am-5pm GMT</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 