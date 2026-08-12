export type SiteChatTopic = {
  id: string;
  label: string;
  answer: string;
};

/** Curated replies for the marketing light chatbot (no AI). */
export const SITE_CHAT_TOPICS: SiteChatTopic[] = [
  {
    id: 'what-is',
    label: 'What is Fleet Track PRO?',
    answer:
      'Fleet Track PRO is UK fleet compliance software for DVSA walkaround checks, defect reporting, MOT and tax tracking, and repair close-out. It is not warehouse or stock inventory software.',
  },
  {
    id: 'pricing',
    label: 'How much does it cost?',
    answer:
      '£8 per vehicle per month (minimum 2 vehicles). Annual billing is £84 per vehicle per year. You get unlimited team members — you only pay per vehicle. New companies get a 7-day free trial with no card required.',
  },
  {
    id: 'trial',
    label: 'How does the free trial work?',
    answer:
      'Start from “Start 7-Day Free Trial” on the website. You can set up your company, add vehicles, and invite drivers during the trial. No card is required to begin.',
  },
  {
    id: 'devices',
    label: 'Does it work on phones?',
    answer:
      'Yes. Drivers use the companion app on iOS and Android for daily checks and defects. Managers use the web dashboard for fleet overview, reporting, team invites, and billing.',
  },
  {
    id: 'setup',
    label: 'How long does setup take?',
    answer:
      'Most managers add vehicles and invite their first drivers within an hour. Start with one vehicle for a quick walkthrough, then roll out to the rest of the fleet.',
  },
  {
    id: 'cancel',
    label: 'Can I cancel anytime?',
    answer:
      'Yes. Monthly plans cancel anytime from billing in the dashboard — access continues until the end of the paid month. Annual plans are paid upfront for 12 months; you can stop renewal, but unused months are not refunded.',
  },
];

export const SITE_CHAT_WHATSAPP_URL =
  'https://wa.me/447438146343?text=Hi%20Fleet%20Track%20PRO%2C%20I%20have%20a%20question%20from%20the%20website%20chat.';
