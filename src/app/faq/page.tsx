import React from 'react';
import Navbar from '../components/Navbar';
import { HomeFaqJsonLd } from '@/components/HomeFaqJsonLd';
import { HOME_FAQ_ITEMS } from '@/content/homeFaq';
import Link from 'next/link';

export default function FAQ() {
  const faqs = [
    ...HOME_FAQ_ITEMS,
    {
      question: "How do I get an account?",
      answer: "New companies sign up on this website by selecting Start 14-Day Free Trial — accounts and subscriptions can only be created on the web. You then set up your company and invite your team by email. Invited team members open their invite link to set a password, then sign in to the companion app on iOS or Android. Managers sign in to the web dashboard via Log in.",
    },
    {
      question: "Do I need special hardware to use the app?",
      answer: "No. You can run Fleet Track PRO with standard smartphones and your web browser. Vehicles are added in the dashboard and selected in the app for inspections, defects, and workflow updates.",
    },
    {
      question: "Do I need a limited company to use the app?",
      answer: "No. The app works for sole traders, partnerships, and limited companies.",
    },
    {
      question: "What does the fleet subscription cover?",
      answer: "Your subscription covers fleet management — vehicle inspections, defect workflow, MOT and tax tracking, and team management across the web dashboard and companion app.",
    },
    {
      question: "How do digital vehicle walkaround checks work?",
      answer: "Drivers use the iOS or Android app to complete a structured pre-use checklist and provide six walkaround photos covering the front, rear, both sides, interior and odometer. Each submitted inspection is timestamped and linked to the user and vehicle.",
    },
    {
      question: "What happens when a driver reports a vehicle defect?",
      answer: "The driver records the issue, severity, description and available photo evidence. Managers are notified, the vehicle is shown as requiring attention, and the job can be tracked through open, scheduled, waiting-for-parts and completed stages.",
    },
    {
      question: "How do fleet MOT and tax reminders work?",
      answer: "Managers can view available MOT dates and tax status alongside each vehicle record, refresh DVLA information on demand, and receive seven-day warnings for approaching dates. The operator remains responsible for checking the official position and arranging renewals.",
    },
    {
      question: "How much does the fleet plan cost?",
      answer: "£8 per vehicle per month, with a minimum of 2 vehicles. Annual billing is £84 per vehicle per year (about £7 per month equivalent). See the Pricing page for the calculator and trial options.",
    },
    {
      question: "Does this work on Android and iOS?",
      answer: "Yes. The companion app runs on both Android and iOS and is used by your team day-to-day for vehicle inspections, defect logging, and workflow updates. Managers also get a web dashboard for analytics, team management, and billing.",
    },
    {
      question: "How do I subscribe?",
      answer: "Subscriptions are set up on the website only — the mobile app is a companion app and does not handle payment. Managers subscribe from the Pricing page or from the Subscription section of the web dashboard, using a card via our Stripe checkout. New companies get a 14-day free trial; no card is required to start the trial.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. Cancel from Manage Billing in the web dashboard. Monthly plans can be cancelled anytime and access continues until the end of the current billing month. Annual plans are a 12-month term paid upfront at a discount — you can cancel the renewal at any time (so you won\u2019t be charged again), but unused months within the paid year are not refunded.",
    },
    {
      question: "How should I introduce Fleet Track PRO to drivers?",
      answer: "Start with one vehicle and show drivers the short mobile inspection flow on a phone they already carry. The structured steps and required photos replace paper hand-ins, while managers can see completed submissions from the dashboard. We can help with a practical rollout plan by email or WhatsApp.",
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "After cancellation, your company data remains for a reasonable period so you can reactivate if needed. You can request permanent deletion by emailing help@fleettrackpro.co.uk. See our Subscription Terms and Privacy Policy for retention details.",
    },
    {
      question: "How long does setup take?",
      answer: "Most managers add vehicles and invite their first drivers within an hour. New companies get a 14-day free trial on the web — no card required — so you can test the full workflow before subscribing.",
    },
    {
      question: "Is my data secure?",
      answer: "Data is stored in Firebase (Google Cloud) with encryption. Access is role-based: staff see only what they need; managers use the dashboard with company-scoped data.",
    },
    {
      question: "Can Fleet Track PRO support a large fleet or team?",
      answer: "Yes. Every plan includes unlimited team members, and we can provide tailored onboarding for larger fleet deployments. Contact sales@fleettrackpro.co.uk or use the Contact page to discuss your requirements.",
    },
  ];

  return (
    <div className="marketing-shell">
      <HomeFaqJsonLd items={faqs} path="/faq" />
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Fleet Management Software FAQs</h1>
          <p className="text-slate-600 mb-10 text-lg">
            Answers about Fleet Track PRO pricing, setup, inspections, defects and fleet management.
          </p>
          <nav aria-label="Popular product questions" className="mb-10 flex flex-wrap gap-3 text-sm">
            <Link
              href="/vehicle-walkaround-check-app"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-blue-300 hover:text-[var(--brand-blue)]"
            >
              Walkaround check app
            </Link>
            <Link
              href="/vehicle-defect-reporting-software"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-blue-300 hover:text-[var(--brand-blue)]"
            >
              Defect reporting
            </Link>
            <Link
              href="/fleet-mot-tax-reminders"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-blue-300 hover:text-[var(--brand-blue)]"
            >
              MOT and tax reminders
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-blue-300 hover:text-[var(--brand-blue)]"
            >
              Pricing
            </Link>
          </nav>

          <div className="space-y-6">
            {faqs.map((item) => (
              <div key={item.question} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{item.question}</h2>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

