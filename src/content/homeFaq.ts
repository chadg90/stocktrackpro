export type HomeFaqItem = {
  question: string;
  answer: string;
};

/** Short set for the homepage — pricing and full list live on /pricing and /faq. */
export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: 'Is this warehouse or stock inventory software?',
    answer:
      'No. Fleet Track PRO is UK fleet compliance software for DVSA walkaround checks, defect reporting, MOT and tax tracking, and repair close-out — not warehouse inventory.',
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
      'Yes. Message us on WhatsApp or use the Contact page and we will walk through inspections, defects, and renewals for your fleet size. You can also start a 7-day free trial with no card required.',
  },
];
