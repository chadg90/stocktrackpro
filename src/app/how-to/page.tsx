import React from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle, Smartphone, QrCode, Car, Users, Settings } from 'lucide-react';

export default function HowTo() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">
            How to Use <span className="text-primary">Stock Track PRO</span>
          </h1>
          <p className="text-xl text-white/80 mb-12">
            Complete step-by-step guide to get the most out of your asset, equipment, and fleet management system.
          </p>

          {/* Getting Started Section */}
          <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Account Setup</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Download Stock Track PRO from the App Store</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Create an account or sign in</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Join a company using an access code OR create a new company</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Complete your profile setup</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Company Setup (Managers)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Go to Manager Dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Generate access codes for team members</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Set up locations for your assets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Add initial assets, equipment and fleet</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Asset Management Section */}
          <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Asset Management Workflow</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Adding Assets (Managers)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Navigate to Assets tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Tap "Add Asset"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Fill in details: Asset name and description, QR code (scan or enter manually), Location assignment, Condition status</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Save the asset</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Checking Out Assets (All Users)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Go to Scan tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Tap "Check Out" button</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Scan QR code on the asset</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Confirm the checkout</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">5</span>
                    <span>Asset is now assigned to you</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Checking In Assets (All Users)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Go to Scan tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Tap "Check In" button</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Scan QR code on the asset</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Confirm the check-in</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">5</span>
                    <span>Asset is returned to available status</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Fleet Management Section */}
          <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Fleet Management Workflow</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Adding Vehicles (Managers)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Navigate to Fleet tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Tap "Add Vehicle"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Enter vehicle details: Registration number, Make, model, year, VIN number, Assigned user, Current status</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Save the vehicle</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Performing Vehicle Inspections (All Users)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Go to Fleet tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Tap "Perform Vehicle Check"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Select vehicle from dropdown</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Take 6 required photos: Front exterior, Rear exterior, Driver side, Passenger side, Interior, Mileage/odometer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">5</span>
                    <span>Enter current mileage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">6</span>
                    <span>Select overall condition (Good or Poor)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">7</span>
                    <span>If Poor condition, report defects: Select defect type, Choose severity level, Add description</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">8</span>
                    <span>Submit inspection</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Viewing Inspection Reports (All Users)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Go to Fleet tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Tap on any inspection in your history</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>View complete report with: All 6 photos, Inspection details, Defect information (if any), Inspector name and date</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Managing Fleet (Managers)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Go to Manager Dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>View fleet statistics and alerts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Check Vehicle Inspections for all team reports</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Review defect notifications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">5</span>
                    <span>Update vehicle statuses as needed</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Team Management Section */}
          <div className="bg-black border border-primary/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Team Management (Managers)</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Adding Team Members</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">1</span>
                    <span>Go to Manager Dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">2</span>
                    <span>Tap "Generate Access Code"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">3</span>
                    <span>Share code with new team member</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">4</span>
                    <span>Team member uses code during signup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary mr-3 mt-0.5">5</span>
                    <span>They're automatically added to your company</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Managing Permissions</h3>
                <div className="bg-primary/5 rounded-lg p-4">
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5" />
                      <span><strong>Managers</strong> - Can manage assets, vehicles, and team members</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5" />
                      <span><strong>Users</strong> - Can check in/out assets and perform vehicle inspections</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Pro Tips</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Asset Management</h3>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-primary mr-2 mt-1" />
                    <span>Use descriptive names for easy identification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-primary mr-2 mt-1" />
                    <span>Regularly update asset conditions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-primary mr-2 mt-1" />
                    <span>Set up clear location hierarchies</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Fleet Management</h3>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-primary mr-2 mt-1" />
                    <span>Take clear, well-lit inspection photos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-primary mr-2 mt-1" />
                    <span>Report defects immediately for safety</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-primary mr-2 mt-1" />
                    <span>Review inspection history regularly</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
