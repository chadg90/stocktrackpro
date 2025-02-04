'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', company: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-zinc-800 p-8 rounded-lg border border-zinc-600 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-6">Get in Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-zinc-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full px-8 py-3 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors border border-zinc-600"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </div>

                {status === 'success' && (
                  <p className="text-green-400 text-center">Message sent successfully!</p>
                )}
                {status === 'error' && (
                  <p className="text-red-400 text-center">Failed to send message. Please try again.</p>
                )}
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Contact Information</h2>
                <p className="text-zinc-300 mb-8">
                  Have questions about Stock Track PRO? We're here to help! Request a demo to see how our tool management solution can work for your business.
                </p>
              </div>

              <div className="bg-zinc-800 p-8 rounded-lg border border-zinc-600 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Email Us</h3>
                    <p className="text-zinc-300">support@stocktrackpro.co.uk</p>
                    <p className="text-zinc-300">sales@stocktrackpro.co.uk</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800 p-8 rounded-lg border border-zinc-600">
                <h3 className="text-xl font-semibold text-white mb-3">Book a Demo</h3>
                <p className="text-zinc-300 mb-4">
                  See Stock Track PRO in action with a personalized demo. Our team will show you how to:
                </p>
                <ul className="space-y-2 text-zinc-300 mb-6">
                  <li>• Track and manage your tools effectively</li>
                  <li>• Set up QR code scanning</li>
                  <li>• Monitor tool locations and conditions</li>
                  <li>• Use the mobile app</li>
                </ul>
                <p className="text-zinc-300">
                  Contact us today to schedule your demo session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 