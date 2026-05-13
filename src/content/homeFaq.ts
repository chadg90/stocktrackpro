export type HomeFaqItem = {
  question: string;
  answer: string;
};

export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: 'Is Stock Track PRO suitable for O-licence holders?',
    answer:
      'Yes. Stock Track PRO supports O-licence record keeping by timestamping inspections, defect reports and repair close-out activity in one digital workflow.',
  },
  {
    question: 'How many users can I add?',
    answer:
      'User allowance scales with your subscribed fleet size: up to 15 users on Starter, 35 on Growth, 75 on Business, and unlimited on Enterprise.',
  },
  {
    question: 'What vehicles does Stock Track PRO support?',
    answer: 'Any vehicle in your fleet — vans, HGVs, plant equipment, and cars.',
  },
  {
    question: 'Does it work across the whole of the UK?',
    answer:
      'Yes. Stock Track PRO is used by fleet operators nationwide, from sole traders with a handful of vans to businesses running 35+ vehicles.',
  },
  {
    question: 'Is there a long-term contract?',
    answer:
      'Monthly plans can be cancelled anytime with no long-term contract. Annual plans are paid upfront for 12 months; you can cancel renewal, but unused months are not refunded.',
  },
  {
    question: 'How much does Stock Track PRO cost?',
    answer:
      '£8 per vehicle per month, including VAT at 20%, with a minimum subscription of 5 vehicles. Annual billing is £84 per vehicle per year.',
  },
];
