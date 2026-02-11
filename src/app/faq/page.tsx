import React from 'react';
import Navbar from '../components/Navbar';

export default function FAQ() {
  const faqs = [
    {
      question: "How do I get an account?",
      answer: "Download Stock Track PRO from the App Store or Google Play. In the app you can create an account and either join a company using an access code (from your manager) or create a new company. Managers can also sign in on the web dashboard; there is no separate web sign-up—new users start in the app.",
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
      answer: "Yes. The app is on both Android and iOS. Managers also get access to a web dashboard for analytics, team management, and subscription (web payers can manage billing in the dashboard).",
    },
    {
      question: "How do I subscribe—app or web?",
      answer: "Managers can subscribe on the web (Pricing page, pay by card) or in the app (App Store / Google Play). Web subscriptions can be managed or cancelled from the dashboard. In-app subscriptions are managed in your device’s store. New users get a 7-day free trial.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. There is no long-term contract. If you subscribed on the web, use “Manage subscription” in the dashboard to update or cancel. If you subscribed in the app, cancel via your App Store or Google Play subscription settings.",
    },
    {
      question: "Is my data secure?",
      answer: "Data is stored in Firebase (Google Cloud) with encryption. Access is role-based: staff see only what they need; managers use the dashboard with company-scoped data.",
    },
    {
      question: "We have a very large fleet or many users. Is there an Enterprise plan?",
      answer: "Yes. The Enterprise plan includes up to 75 users, 1,500 assets, and 150 vehicles, plus dedicated support and custom onboarding. For larger deployments, contact us for a tailored quote.",
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
              <div key={item.question} className="bg-black border border-primary/25 rounded-2xl p-6 sm:p-7">
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

