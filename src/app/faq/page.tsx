import React from 'react';
import Navbar from '../components/Navbar';

export default function FAQ() {
  const faqs = [
    {
      question: "Do I need QR codes to use the app?",
      answer: "QR code labels are required for tools. Fleet is added manually and users select a vehicle from a dropdown.",
    },
    {
      question: "Do I need a limited company to use the app?",
      answer: "No. The app works for sole traders, partnerships, and limited companies.",
    },
    {
      question: "Can I use this for fleet only?",
      answer: "Yes. Subscriptions include both tool and fleet management so you can use either or both.",
    },
    {
      question: "Does this work on Android and iOS?",
      answer: "Yes. The app is available on both platforms and includes a web dashboard for managers.",
    },
    {
      question: "Is my data secure?",
      answer: "All data is encrypted and stored using Firebase on Google Cloud. Access is role-based.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. There is no contract. Cancel directly in the App Store or Google Play. New users get a 7-day free trial.",
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

