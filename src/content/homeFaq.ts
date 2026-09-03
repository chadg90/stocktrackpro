export type HomeFaqItem = {
  question: string;
  answer: string;
};

/** Short set for the homepage — pricing and full list live on /pricing and /faq. */
export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: 'What does Fleet Track PRO help fleet managers do?',
    answer:
      'Fleet Track PRO helps UK fleets run daily vehicle walkaround checks, report defects with photos, track repair close-out, monitor MOT and tax dates, and keep managers informed from one platform.',
  },
  {
    question: 'How many users can I add?',
    answer:
      'Unlimited team members on every plan — drivers, managers, and fitters. You only pay per vehicle, not per user.',
  },
  {
    question: 'Is there a long-term contract?',
    answer:
      'Monthly plans cancel anytime. Annual plans are paid upfront for 12 months; you can stop renewal, but unused months are not refunded.',
  },
  {
    question: 'Can I see a demo before I start?',
    answer:
      'Yes. Use the interactive phone demo on the homepage to click through a daily inspection. For a live walkthrough of your fleet size, message us on WhatsApp or use the Contact page. You can also start a 14-day free trial with no card required.',
  },
];
