export type HomeFaqItem = {
  question: string;
  answer: string;
};

/** Short set for the homepage — pricing and full list live on /pricing and /faq. */
export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: 'Is Fleet Track PRO warehouse or inventory stock tracking software?',
    answer:
      'No. Despite the brand name, Fleet Track PRO is UK van fleet compliance software — daily DVSA walkaround checks, vehicle defect reporting, MOT tracking, and repair close-out. It is not warehouse inventory control, stock management, or general asset tracking software.',
  },
  {
    question: 'Is Fleet Track PRO suitable for van fleets?',
    answer:
      'Yes. Fleet Track PRO is built for commercial van and light fleet operators — daily inspections, defect reports, MOT tracking, and repair close-out in one workflow. See our Compliance Centre for guidance on defect records.',
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
      'Yes — as an optional Plant & Machinery add-on (separate from the fleet plan). Fitters complete LOLER, service, pre-hire/off-hire, and PUWER forms in one inspection entry, with a PDF per form and manager alerts when examinations are due. See pricing for plant rates.',
  },
];
