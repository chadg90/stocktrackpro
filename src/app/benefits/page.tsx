import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { Shield, Clock, Users, Wrench, BarChart, Smartphone, Cloud, HeartHandshake } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      title: "Enhanced Security",
      description: "Keep your assets secure with QR code tracking and user authentication. Every asset movement is logged and monitored.",
      icon: <Shield className="w-6 h-6 text-primary" />
    },
    {
      title: "Time Saving",
      description: "Reduce time spent on manual inventory checks. Quick check-in/check-out process with mobile scanning.",
      icon: <Clock className="w-6 h-6 text-primary" />
    },
    {
      title: "Team Management",
      description: "Assign assets to specific team members and track responsibility. Improve accountability across your organization.",
      icon: <Users className="w-6 h-6 text-primary" />
    },
    {
      title: "Maintenance Tracking",
      description: "Schedule and track asset maintenance. Receive alerts for upcoming maintenance to prevent downtime.",
      icon: <Wrench className="w-6 h-6 text-primary" />
    },
    {
      title: "Analytics & Reporting",
      description: "Generate detailed reports on asset usage, maintenance history, and costs. Make data-driven decisions.",
      icon: <BarChart className="w-6 h-6 text-primary" />
    },
    {
      title: "Mobile Access",
      description: "Access your asset inventory anywhere with our mobile app. Perfect for on-site management.",
      icon: <Smartphone className="w-6 h-6 text-primary" />
    },
    {
      title: "Cloud Storage",
      description: "Secure cloud storage for all your asset data. Access history and reports from anywhere, anytime.",
      icon: <Cloud className="w-6 h-6 text-primary" />
    },
    {
      title: "Customer Support",
      description: "24/7 customer support to help you get the most out of Stock Track PRO. We're here when you need us.",
      icon: <HeartHandshake className="w-6 h-6 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-6">
            Why Choose <span className="text-primary">Stock Track PRO</span>?
          </h1>
          <p className="text-xl text-white">
            Discover how our asset management solution transforms your workflow,
            reduces costs, and boosts productivity.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-black p-8 rounded-lg border border-primary/20 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {benefit.title}
              </h3>
              <p className="text-white/80">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="max-w-3xl mx-auto bg-primary/10 rounded-2xl p-8 border border-primary/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Asset Management?
            </h2>
            <p className="text-white/80 mb-8">
              Join thousands of businesses that trust Stock Track PRO for their asset management needs.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 text-white bg-primary hover:bg-primary-light rounded-md transition-colors"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 