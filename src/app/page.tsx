import React from 'react';
import Navbar from './components/Navbar';
import { Wrench, QrCode, Map, Smartphone, Users, ClipboardList } from 'lucide-react';
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
              Fleet and Asset Management for Small Businesses, Trades and Contractors
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed">
              Track tools, equipment, and vehicles in one simple app. Handle inspections, defects, QR check-ins, and team management in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-primary text-white rounded-lg bg-primary hover:bg-primary-light transition-colors text-sm sm:text-base"
              >
                Contact
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-primary/20 text-white rounded-lg hover:border-primary/50 transition-colors text-sm sm:text-base"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Feature Highlights */}
      <div className="relative bg-black py-12 sm:py-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-12 text-center">
            Work Smarter. Stay Organised. Reduce Loss and Downtime.
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <QrCode className="w-6 h-6 text-primary" />,
                title: "QR Check-In / Check-Out",
                description: "Instant check-in and check-out with QR scanning across tools, equipment, and vehicles."
              },
              {
                icon: <Map className="w-6 h-6 text-primary" />,
                title: "Fleet Tracking",
                description: "Monitor vehicles, inspections, mileage, and service dates across every site."
              },
              {
                icon: <Smartphone className="w-6 h-6 text-primary" />,
                title: "Tool and Asset Management",
                description: "Track tools and equipment across locations, jobs, and users with full history."
              },
              {
                icon: <Users className="w-6 h-6 text-primary" />,
                title: "Team and Role Management",
                description: "Managers oversee companies, admins run the platform, and users work in the field."
              },
              {
                icon: <Wrench className="w-6 h-6 text-primary" />,
                title: "Vehicle Inspections",
                description: "Capture required photos, checklist items, and defects to keep vehicles compliant."
              },
              {
                icon: <ClipboardList className="w-6 h-6 text-primary" />,
                title: "Defect Reporting",
                description: "Flag defects, mark repairs complete, and update vehicle status instantly."
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

      {/* Why Stock Track PRO */}
      <div className="relative bg-black py-12 sm:py-20">
        <div className="container relative mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-12 text-center">
            Why Stock Track PRO
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              { title: "Asset Tracking", description: "Track tools, equipment, and machinery across locations, jobs, and users.", icon: <ClipboardList className="w-6 h-6 text-primary" /> },
              { title: "QR Scanning", description: "Instant check-in and check-out using built-in QR scanning for fast workflows.", icon: <QrCode className="w-6 h-6 text-primary" /> },
              { title: "Fleet Management", description: "Log every vehicle, inspection, mileage reading, and service date.", icon: <Map className="w-6 h-6 text-primary" /> },
              { title: "Photo Inspections", description: "Capture required inspection photos and attach defect reports on the spot.", icon: <Smartphone className="w-6 h-6 text-primary" /> },
              { title: "Defect Reporting", description: "Flag defects, mark repairs complete, and automatically update vehicle status.", icon: <Wrench className="w-6 h-6 text-primary" /> },
              { title: "Team Management", description: "Managers control their company; admins run the platform; field users keep work moving.", icon: <Users className="w-6 h-6 text-primary" /> },
            ].map((item, index) => (
              <div key={index} className="bg-black border border-primary/20 rounded-xl p-6 sm:p-7 hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screenshots / Visuals placeholder */}
      <div className="relative bg-black py-12 sm:py-20">
        <div className="container relative mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-10 text-center">
            Platform Views
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              { title: "Manager Dashboard", description: "At-a-glance metrics for total assets, vehicles, and team members." },
              { title: "Vehicle Inspection", description: "Guided checklist with required photos and defect logging." },
              { title: "QR Scan", description: "Fast scan to check items in or out and record who has them." },
              { title: "Asset List", description: "Filtered views of tools and equipment across locations and projects." },
              { title: "Vehicle Status", description: "Status by vehicle including active, maintenance, and defects." },
            ].map((item, index) => (
              <div key={index} className="bg-black border border-primary/20 rounded-xl p-6 sm:p-7">
                <div className="text-white text-base sm:text-lg font-semibold mb-2">{item.title}</div>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="relative bg-black py-12 sm:py-20">
        <div className="container relative mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-10 text-center">
            Why Companies Choose Stock Track PRO
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {[
              "Stop losing tools and assets.",
              "Reduce downtime with faster defect reporting.",
              "Keep vehicles safe and compliant.",
              "See team activity in one place.",
              "Get audit trails for insurance and compliance.",
              "Use on iOS, Android, and Web Dashboard.",
            ].map((benefit, index) => (
              <div key={index} className="bg-black border border-primary/20 rounded-xl p-5 sm:p-6">
                <p className="text-white/85 text-sm sm:text-base leading-relaxed">{benefit}</p>
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
              Start Managing Your Fleet and Tools Today
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8">
              New users get a 7-day free trial. All subscriptions are managed through the app. Managers can access the dashboard to review company data.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
                href="/contact"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-white bg-primary hover:bg-primary-light rounded-lg transition-colors text-sm sm:text-base"
            >
                Contact
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-primary/30 hover:border-primary/50 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                View Pricing
            </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
