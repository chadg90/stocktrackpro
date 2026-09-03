import { absolutePageUrl } from '@/lib/site';
import { getAllPublishedComplianceArticles } from '@/lib/compliance-articles/server';

const STATIC_LLMS_BODY = `# Fleet Track PRO

> UK fleet management and DVSA compliance software for commercial vehicle operators.

Fleet Track PRO helps UK businesses run daily vehicle walkaround checks, report vehicle defects with photos, track MOT and tax renewals, and close out repairs from one platform. Built for cars, vans, and light commercial fleets.

Canonical website: ${absolutePageUrl('/')}
Support email: help@fleettrackpro.co.uk

## What it does

- Daily vehicle walkaround inspections via iOS and Android app
- Defect reporting with timestamped photo evidence
- Defect close-out workflow: report, notify, repair, resolve
- MOT and tax expiry monitoring with 7-day advance warnings
- Manager web dashboard for fleet oversight and team management
- Timestamped digital records for DVSA roadside checks and audits
- Role-based access for drivers, managers, and fitters

## Who it is for

UK fleet operators — trades, groundworks, logistics, construction, electrical, and plumbing businesses. Suitable for sole traders and companies running 2+ vehicles (minimum paid subscription quantity is 2 vehicles). Works for cars, vans, and light commercial fleets.

## Pricing

- £8 per vehicle per month (minimum 2 vehicles)
- Annual fleet billing: £84 per vehicle per year
- Unlimited team members on every plan (no per-user fee)
- 14-day free trial — no card required
- Monthly plans can be cancelled anytime

## Key pages

- Home: ${absolutePageUrl('/')}
- Features: ${absolutePageUrl('/features')}
- Vehicle walkaround check app: ${absolutePageUrl('/vehicle-walkaround-check-app')}
- Vehicle defect reporting software: ${absolutePageUrl('/vehicle-defect-reporting-software')}
- Fleet MOT and tax reminders: ${absolutePageUrl('/fleet-mot-tax-reminders')}
- Pricing: ${absolutePageUrl('/pricing')}
- FAQ: ${absolutePageUrl('/faq')}
- Newstreet Groundworks case study: ${absolutePageUrl('/customers/newstreet')}
- NEEMT emergency vehicle fleet case study: ${absolutePageUrl('/customers/neemt')}
- Compliance Centre: ${absolutePageUrl('/compliance-centre')}
- Sign up (trial): ${absolutePageUrl('/onboarding')}

## Compliance articles
`;

const STATIC_LLMS_FOOTER = `
## Platform and support

- Platform: iOS app, Android app, web dashboard
- Data: DVLA integration for MOT and tax status visibility
- Support: UK-based via email and WhatsApp
- Record retention: designed to support fleet compliance record keeping

## Contact

Website: ${absolutePageUrl('/')}
Email: help@fleettrackpro.co.uk
Sales: sales@fleettrackpro.co.uk
`;

export async function buildLlmsTxt(): Promise<string> {
  const articles = await getAllPublishedComplianceArticles();
  const articleLines = articles
    .map((article) => {
      const label = article.title.replace(/\s+/g, ' ').trim();
      return `- ${label}: ${absolutePageUrl(`/compliance-centre/${article.slug}`)}`;
    })
    .join('\n');

  return `${STATIC_LLMS_BODY}\n${articleLines}\n${STATIC_LLMS_FOOTER}`;
}
