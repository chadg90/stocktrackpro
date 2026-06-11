export type HomeFaqItem = {
  question: string;
  answer: string;
};

/** Short set for the homepage — pricing and full list live on /pricing and /faq. */
export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: 'Is Stock Track PRO suitable for O-licence holders?',
    answer:
      'Yes. Timestamped inspections, defect reports, and repair close-out sit in one workflow — see our Compliance Centre for guidance on defect records.',
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
];
