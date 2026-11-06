import PricingPageClient from '@/components/PricingPageClient';
import PricingTrialCta from '@/components/PricingTrialCta';

export default function PricingPage() {
  return <PricingPageClient trialCta={<PricingTrialCta />} />;
}
