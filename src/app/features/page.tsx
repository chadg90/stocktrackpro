import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { Car, ClipboardList, QrCode, Users, Wrench, RefreshCw, Map, Shield } from 'lucide-react';

export default function Features() {
  const featureBlocks = [
    {
      title: "Fleet Management",
      description: "Track vehicles, mileage, inspections, service dates, and defects with full history.",
      icon: <Car className="w-6 h-6 text-primary" />,
    },
    {
      title: "Asset and Tool Tracking",
      description: "Track tools across sites, projects, and users. QR scanning makes check-in and check-out instant.",
      icon: <ClipboardList className="w-6 h-6 text-primary" />,
    },
    {
      title: "Vehicle Inspections",
      description: "Structured inspections with required photos, checklist items, and defect flagging.",
      icon: <Wrench className="w-6 h-6 text-primary" />,
    },
    {
      title: "Defect Workflow",
      description: "Mark a defect to move a vehicle into maintenance. Resolve the defect to return it to active status.",
      icon: <Shield className="w-6 h-6 text-primary" />,
    },
    {
      title: "QR Code Module",
      description: "Apply QR codes to tools for scanning, check items in or out, and track who had the item last.",
      icon: <QrCode className="w-6 h-6 text-primary" />,
    },
    {
      title: "Team Roles",
      description: "Manager provides company oversight. Users focus on field work with scoped access.",
      icon: <Users className="w-6 h-6 text-primary" />,
    },
  ];

  const dashboardHighlights = [
    "At-a-glance metrics for total assets, vehicles, and team members (company scoped).",
    "Manual refresh from the header to pull the latest data.",
    "Quick navigation to team management, add asset, locations, history, vehicle inspections, and access code creation.",
    "Generate a single-use, 7-day access code tied to the manager’s company for onboarding.",
    "Defect notification modal shows vehicle, inspector, date, type, severity, and description with options to view the full report or dismiss.",
    "Dashboard is used to view details and export information; subscriptions are managed in the mobile app.",
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h1 className="text-4xl font-bold text-white mb-6">
            Features
          </h1>
          <p className="text-xl text-white/85 leading-relaxed">
            Fleet and asset management built for small businesses, trades, and contractors. Works on iOS, Android, and the web dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-16">
          {featureBlocks.map((feature) => (
            <div key={feature.title} className="bg-black border border-primary/20 rounded-2xl p-6 sm:p-7 hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-black border border-primary/25 rounded-2xl p-8 sm:p-10 max-w-6xl mx-auto mb-16">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">Manager Dashboard</h2>
              <p className="text-white/80 mb-4">
                Managers with an active subscription can view company data across tools, vehicles, users, and reports. Actions focus on reviewing data, exporting, and onboarding; subscriptions remain managed in the mobile app.
              </p>
              <ul className="space-y-3 text-white/85">
                {dashboardHighlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary"></span>
                    <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to see it in action?</h3>
          <p className="text-white/80 mb-6">New users receive a 7-day free trial. Subscriptions are managed in the app.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-white bg-primary hover:bg-primary-light rounded-lg transition-colors text-sm sm:text-base"
            >
              Contact
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-primary/30 hover:border-primary/50 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

