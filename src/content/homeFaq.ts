export type HomeFaqItem = {
  question: string;
  answer: string;
};

/** Short set for the homepage — pricing and full list live on /pricing and /faq. */
export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: 'Is Fleet Track PRO warehouse or inventory stock tracking software?',
    answer:
      'No. It is UK van fleet compliance software for DVSA walkaround checks, defect reporting, MOT tracking, and repair close-out — not warehouse inventory or stock management.',
  },
  {
    question: 'How many users can I add?',
    answer:
      'Unlimited team members on every plan — drivers, managers, and fitters. No per-user fee.',
  },
  {
    question: 'Is there a long-term contract?',
    answer:
      'Monthly plans cancel anytime. Annual plans are paid upfront for 12 months; you can stop renewal, but unused months are not refunded.',
  },
  {
    question: 'Do you support plant and LOLER records?',
    answer:
      'Yes — as an optional Plant & Machinery add-on, separate from the fleet plan. Details and pricing are on the Pricing page.',
  },
];
