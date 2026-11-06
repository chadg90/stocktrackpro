import type { ReactNode } from 'react';
import Link from 'next/link';
import { absolutePageUrl } from '@/lib/site';
import { FREE_TRIAL_PHRASE, PLATFORM_AVAILABILITY } from '@/lib/brand';

export type CommercialFaqItem = {
  question: string;
  /** Plain-text answer for FAQPage JSON-LD (include absolute URLs where linked). */
  answer: string;
  /** Optional rich answer for the visible section; falls back to `answer`. */
  answerNode?: ReactNode;
};

const legalGuideHref = '/compliance-centre/are-daily-van-checks-mandatory-uk-2026/';
const retentionGuideHref = '/compliance-centre/how-long-to-keep-fleet-records/';
const pricingHref = '/pricing/';

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[var(--brand-blue)] font-medium underline underline-offset-4 hover:text-[var(--brand-blue-hover)]"
    >
      {children}
    </Link>
  );
}

/**
 * Shared Common questions for walkaround and defect feature pages.
 * Keep visible copy and JSON-LD text aligned.
 */
export function getCommercialFeatureFaqs(): CommercialFaqItem[] {
  const legalUrl = absolutePageUrl(legalGuideHref);
  const retentionUrl = absolutePageUrl(retentionGuideHref);
  const pricingUrl = absolutePageUrl(pricingHref);

  return [
    {
      question: 'Can drivers do walkaround checks on their phone?',
      answer: `Yes. Drivers complete walkaround checks in the Fleet Track PRO mobile app on their phone (${PLATFORM_AVAILABILITY}). They follow a structured checklist, take the required photos and can raise a defect if something looks wrong. Managers then review the completed check from the web dashboard.`,
    },
    {
      question: 'Is there a better way than paper defect sheets?',
      answer:
        'Paper sheets are easy to lose, hard to read and slow to collect across a fleet. A digital process keeps each report with photos, a named user and a timestamp in one place. That makes evidence easier to find later and helps you follow defects through to close-out.',
    },
    {
      question: 'How do I set up walkaround checks for a 10–20 vehicle fleet?',
      answer: `Create your company account, add your vehicles and invite drivers to the app. Assign vehicles, then ask drivers to complete the check before use each day. Most fleets of this size can get the first checks flowing within a day, then refine the process as the team settles in. New companies get a ${FREE_TRIAL_PHRASE} with no card required.`,
    },
    {
      question: 'Are daily vehicle checks a legal requirement in the UK?',
      answer: `Expectations depend on your operation and vehicle type. Many commercial operators are expected to run a daily defect reporting system and keep evidence of checks. For a plain-English summary of the UK position, read our guide at ${legalUrl}.`,
      answerNode: (
        <>
          Expectations depend on your operation and vehicle type. Many commercial operators are expected to run a daily
          defect reporting system and keep evidence of checks. For a plain-English summary of the UK position, read our
          guide:{' '}
          <InlineLink href={legalGuideHref}>Are daily vehicle checks a legal requirement in the UK?</InlineLink>
        </>
      ),
    },
    {
      question: 'How long do I need to keep check records?',
      answer: `DVSA guidance expects defect reports and related records to remain available for at least 15 months. Keeping walkaround checks, defect reports and repair close-out together makes that evidence easier to retrieve. See our guide at ${retentionUrl}.`,
      answerNode: (
        <>
          DVSA guidance expects defect reports and related records to remain available for at least 15 months. Keeping
          walkaround checks, defect reports and repair close-out together makes that evidence easier to retrieve. See
          our guide: <InlineLink href={retentionGuideHref}>How long to keep fleet records</InlineLink>.
        </>
      ),
    },
    {
      question: 'What does it cost?',
      answer: `Fleet Track PRO is from £8 per vehicle per month, with a minimum of two vehicles and unlimited team members. New companies get a ${FREE_TRIAL_PHRASE} with no card required. Full detail is on the Pricing page at ${pricingUrl}.`,
      answerNode: (
        <>
          Fleet Track PRO is from £8 per vehicle per month, with a minimum of two vehicles and unlimited team members.
          New companies get a {FREE_TRIAL_PHRASE} with no card required. See full detail on the{' '}
          <InlineLink href={pricingHref}>Pricing</InlineLink> page.
        </>
      ),
    },
  ];
}
