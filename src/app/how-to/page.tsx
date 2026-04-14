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
            How to use <span className="text-blue-500">Stock Track PRO</span>
          </h1>
          <p className="text-xl text-white/80 mb-12">
            A practical step-by-step guide to help your team manage assets and fleet operations effectively.
          </p>

          {/* Getting Started Section */}
          <div className="bg-black border border-blue-500/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mr-4">
                <Smartphone className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Account Setup</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>A manager signs up on the Stock Track PRO website and selects the appropriate plan</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>The manager signs in to the web dashboard and completes initial company setup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>The manager invites team members by email from the Team page (role: Manager or User)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">4</span>
                    <span>Team members open the invite link, set a password, then sign in to the app</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">5</span>
                    <span>Team members use Log in / Forgot password in the app after accepting their invite</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Company Setup (Managers)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>Open the dashboard Team page and send individual or bulk invites</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>Assign role as Manager or User for each invite</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>Set up locations and operating structure for your assets and fleet</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">4</span>
                    <span>Add your initial assets, equipment, and fleet vehicles</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Asset Management Section */}
          <div className="bg-black border border-blue-500/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mr-4">
                <QrCode className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Asset Management Workflow</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Adding assets (Managers)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>Open the Assets tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>Select Add Asset</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>Complete the details: asset name and description, QR code (scan or enter manually), location assignment, and condition status</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">4</span>
                    <span>Save the asset</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Checking out assets (All users)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>Open the Scan tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>Select Check Out</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>Scan QR code on the asset</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">4</span>
                    <span>Confirm check-out</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">5</span>
                    <span>The asset is now assigned to you</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Checking in assets (All users)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>Open the Scan tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>Select Check In</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>Scan QR code on the asset</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">4</span>
                    <span>Confirm check-in</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">5</span>
                    <span>The asset returns to available status</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Fleet Management Section */}
          <div className="bg-black border border-blue-500/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mr-4">
                <Car className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Fleet Management Workflow</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Adding Vehicles (Managers)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>Navigate to Fleet tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>Tap "Add Vehicle"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>Enter vehicle details: Registration number, Make, model, year, VIN number, Assigned user, Current status</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">4</span>
                    <span>Save the vehicle</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Performing Vehicle Inspections (All Users)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>Go to Fleet tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>Tap "Perform Vehicle Check"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>Select vehicle from dropdown</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">4</span>
                    <span>Take 6 required photos: Front exterior, Rear exterior, Driver side, Passenger side, Interior, Mileage/odometer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">5</span>
                    <span>Enter current mileage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">6</span>
                    <span>Select overall condition (Good or Poor)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">7</span>
                    <span>If Poor condition, report defects: Select defect type, Choose severity level, Add description</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">8</span>
                    <span>Submit inspection</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Viewing Inspection Reports (All Users)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>Go to Fleet tab</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>Tap on any inspection in your history</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>View complete report with: All 6 photos, Inspection details, Defect information (if any), Inspector name and date</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Managing Fleet (Managers)</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>Go to Manager Dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>View fleet statistics and alerts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>Check Vehicle Inspections for all team reports</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">4</span>
                    <span>Review defect notifications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">5</span>
                    <span>Update vehicle statuses as needed</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Team Management Section */}
          <div className="bg-black border border-blue-500/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Team Management (Managers)</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Adding Team Members</h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">1</span>
                    <span>Go to Team in the website dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">2</span>
                    <span>Send invite by email (single or bulk)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">3</span>
                    <span>Choose role as Manager or User</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">4</span>
                    <span>Team member accepts invite via link and sets their password</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-semibold text-blue-500 mr-3 mt-0.5">5</span>
                    <span>They are automatically added to your company and can sign in to the app</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Managing Permissions</h3>
                <div className="bg-blue-500/5 rounded-lg p-4">
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                      <span><strong>Managers</strong> - Can manage assets, vehicles, and team members</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                      <span><strong>Users</strong> - Can check in/out assets and perform vehicle inspections</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                <Settings className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Pro Tips</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Asset Management</h3>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-1" />
                    <span>Use descriptive names for easy identification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-1" />
                    <span>Regularly update asset conditions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-1" />
                    <span>Set up clear location hierarchies</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Fleet Management</h3>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-1" />
                    <span>Take clear, well-lit inspection photos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-1" />
                    <span>Report defects immediately for safety</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-1" />
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
