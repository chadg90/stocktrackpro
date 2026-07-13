import React from 'react';
import Navbar from '../components/Navbar';
import { HomeFaqJsonLd } from '@/components/HomeFaqJsonLd';
import { HOME_FAQ_ITEMS } from '@/content/homeFaq';

export default function FAQ() {
  const faqs = [
    ...HOME_FAQ_ITEMS,
    {
      question: "How do I get an account?",
      answer: "New companies sign up on this website by selecting Start 7-Day Free Trial — accounts and subscriptions can only be created on the web. You then set up your company and invite your team by email. Invited team members open their invite link to set a password, then sign in to the companion app on iOS or Android. Managers sign in to the web dashboard via Log in.",
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
      question: "Can I use this for fleet only?",
      answer: "Yes. Your core subscription covers fleet management only — vehicle inspections, defect workflow, MOT and tax tracking, and team management. Plant & Machinery is an optional add-on if you also maintain lifting equipment and site plant.",
    },
    {
      question: "What is the Plant & Machinery add-on?",
      answer: "An optional module for LOLER thorough examinations, service inspections, and pre-hire / off-hire checks. Fitters complete the forms needed for that visit in one inspection entry — each form generates its own PDF. Managers use the mobile app and web dashboard to register machines, submit inspections, and download reports. Examination due reminders are sent to managers by push notification.",
    },
    {
      question: "How much does Plant & Machinery cost?",
      answer: "£12 per machine per month (including VAT), with a minimum of 3 machines. Annual billing is £120 per machine per year. It is a separate subscription from your fleet vehicle plan and can be set up from the Pricing page or your dashboard.",
    },
    {
      question: "Who can use Plant & Machinery in the app?",
      answer: "Users with the manager role. There is no separate plant role — fitters and managers assigned the manager role can run inspections and view plant reports on the web dashboard.",
    },
    {
      question: "Does this work on Android and iOS?",
      answer: "Yes. The companion app runs on both Android and iOS and is used by your team day-to-day for vehicle inspections, defect logging, and workflow updates. Managers also get a web dashboard for analytics, team management, and billing.",
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
      question: "Will my drivers actually use it?",
      answer: "The app is built for quick daily checks on a phone they already carry — structured steps, required photos, and no paper to hand in. Most teams start with one vehicle and a short walkthrough; managers see submissions in the dashboard straight away. If adoption is a concern, we can help with a simple rollout plan via email or WhatsApp.",
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "After cancellation, your company data remains for a reasonable period so you can reactivate if needed. You can request permanent deletion by emailing help@fleettrackpro.co.uk. See our Subscription Terms and Privacy Policy for retention details.",
    },
    {
      question: "How long does setup take?",
      answer: "Most managers add vehicles and invite their first drivers within an hour. New companies get a 7-day free trial on the web — no card required — so you can test the full workflow before subscribing.",
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
      <HomeFaqJsonLd items={faqs} />
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-white/80 mb-10 text-lg">Answers to common questions about Fleet Track PRO.</p>

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

