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
      title: "Sales Inquiries",
      description: "For pricing and general enquiries",
      email: "sales@stocktrackpro.co.uk",
      actionText: "Email Sales Team",
    },
    {
      title: "Support",
      description: "For technical support and help",
      email: "support@stocktrackpro.co.uk",
      actionText: "Email Support",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 pb-12 sm:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(254,169,23,0.12),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container relative mx-auto px-4">
          <p className="text-primary font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Contact
          </p>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              Get in <span className="text-primary">touch</span>
            </h1>
            <p className="text-lg text-white/75 leading-relaxed">
              Have questions about Stock Track PRO? We&apos;re here to help with any inquiries about our asset management solution.
            </p>
          </div>
        </div>
      </section>

      {/* Form card */}
      <section className="py-12 sm:py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="p-8 sm:p-10 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/15 transition-colors">
              <h2 className="text-xl font-bold text-white mb-6">Send us a message</h2>
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-colors"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-black font-semibold transition-all duration-200 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  aria-busy={sending}
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {sending ? 'Sending…' : 'Send message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-12 sm:py-16 bg-white/[0.02] border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-white/10 bg-black/40 hover:border-primary/25 hover:bg-white/[0.03] transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{method.title}</h3>
                    <p className="text-white/60 text-sm">{method.description}</p>
                  </div>
                </div>
                <p className="text-white/90 mb-6 break-all">{method.email}</p>
                <Link
                  href={`mailto:${method.email}`}
                  className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-black font-semibold transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                  {method.actionText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="py-12 sm:py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="text-xl font-semibold text-white mb-6">What to expect</h3>
            <ul className="space-y-4 text-white/80">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>We aim to respond to all inquiries within 24 hours during business days.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>For urgent matters, please mention &quot;Urgent&quot; in your email subject.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>Business hours: Monday–Friday, 9am–5pm GMT.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
