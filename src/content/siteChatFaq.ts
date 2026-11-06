import { WHATSAPP_SUPPORT_URL } from '@/lib/brand';

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
      'Fleet Track PRO is UK fleet compliance software for daily DVSA walkaround checks, photo-backed defect reporting, repair close-out, MOT and tax tracking, and manager oversight.',
  },
  {
    id: 'pricing',
    label: 'How much does it cost?',
    answer:
      '£8 per vehicle per month (minimum 2 vehicles). Annual billing is £84 per vehicle per year. You get unlimited team members — you only pay per vehicle. New companies get a 14-day free trial with no card required.',
  },
  {
    id: 'trial',
    label: 'How does the free trial work?',
    answer:
      'Start from “Start 14-Day Free Trial” on the website. You can set up your company, add vehicles, and invite drivers during the trial. No card is required to begin.',
  },
  {
    id: 'devices',
    label: 'Does it work on phones?',
    answer:
      'Yes. Drivers use the companion app for daily checks and defects — iPhone app on the App Store, Android app available by invite. Managers use the web dashboard for fleet overview, reporting, team invites, and billing.',
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

/** Support WhatsApp from the site chat panel (no phone number shown in UI). */
export const SITE_CHAT_WHATSAPP_URL = WHATSAPP_SUPPORT_URL;
