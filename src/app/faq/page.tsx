import React from 'react';
import Navbar from '../components/Navbar';

export default function FAQ() {
  const faqs = [
    {
      question: "How do I get an account?",
      answer: "New companies sign up on this website by selecting Start free trial — accounts and subscriptions can only be created on the web. You then set up your company and invite your team by email. Invited team members open their invite link to set a password, then sign in to the companion app on iOS or Android. Managers sign in to the web dashboard via Log in.",
    },
    {
      question: "Do I need QR codes to use the app?",
      answer: "QR codes are used for tools and assets so staff can scan to check in and out. Fleet vehicles are added in the dashboard and selected from a list in the app (e.g. for inspections). You can use fleet only, assets only, or both.",
    },
    {
      question: "Do I need a limited company to use the app?",
      answer: "No. The app works for sole traders, partnerships, and limited companies.",
    },
    {
      question: "Can I use this for fleet only?",
      answer: "Yes. Every plan includes both tool and fleet management; you can use one or both. Vehicle inspections and defect workflow are included where stated on the plan.",
    },
    {
      question: "Does this work on Android and iOS?",
      answer: "Yes. The companion app runs on both Android and iOS and is used by your team day-to-day for QR scanning, vehicle inspections, and defect logging. Managers also get a web dashboard for analytics, team management, and billing.",
    },
    {
      question: "How do I subscribe?",
      answer: "Subscriptions are set up on the website only — the mobile app is a companion app and does not handle payment. Managers subscribe from the Pricing page or from the Subscription section of the web dashboard, using a card via our Stripe checkout. New companies get a 7-day free trial; no card is required to start the trial.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. Cancel from Manage Billing in the web dashboard. Monthly plans can be cancelled anytime and access continues until the end of the current billing month. Annual plans are a 12-month term paid upfront at a discount — you can cancel the renewal at any time (so you won\u2019t be charged again), but unused months within the paid year are not refunded.",
    },
    {
      question: "Is my data secure?",
      answer: "Data is stored in Firebase (Google Cloud) with encryption. Access is role-based: staff see only what they need; managers use the dashboard with company-scoped data.",
    },
    {
      question: "We have a very large fleet or many users. Is there an Enterprise plan?",
      answer: "Yes. We support larger fleets and teams, including tailored onboarding for bigger deployments. Contact us for a tailored quote.",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-white/80 mb-10 text-lg">Answers to common questions about Stock Track PRO.</p>

          <div className="space-y-6">
            {faqs.map((item) => (
              <div key={item.question} className="bg-black border border-blue-500/25 rounded-2xl p-6 sm:p-7">
                <h3 className="text-xl font-semibold text-white mb-2">{item.question}</h3>
                <p className="text-white/80 leading-relaxed text-sm sm:text-base">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

