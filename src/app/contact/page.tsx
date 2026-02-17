'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Mail, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

const HONEYPOT_FIELD = 'website_url';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          [HONEYPOT_FIELD]: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSending(false);
    }
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "Sales Inquiries",
      description: "For pricing and general enquiries",
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
              Our team is ready to assist you with any inquiries about our asset management solution.
            </p>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-black border border-primary/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
              {submitSuccess && (
                <div role="status" aria-live="polite" className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary">
                  Thanks! We&apos;ll get back to you soon.
                </div>
              )}
              {submitError && (
                <div role="alert" aria-live="assertive" className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="hidden" aria-hidden="true">
                  <label htmlFor={HONEYPOT_FIELD}>Leave blank</label>
                  <input
                    id={HONEYPOT_FIELD}
                    name={HONEYPOT_FIELD}
                    type="text"
                    value={honeypot}
                    onChange={e => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-white/80 mb-2">Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-white/80 mb-2">Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-white/80 mb-2">Subject (optional)</label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-white/80 mb-2">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    minLength={10}
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-primary/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-black font-semibold rounded-lg transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
                  aria-busy={sending}
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {sending ? 'Sending…' : 'Send message'}
                </button>
              </form>
            </div>
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