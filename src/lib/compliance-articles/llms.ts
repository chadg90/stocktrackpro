import { SITE_URL } from '@/lib/site';
import { getAllPublishedComplianceArticles } from '@/lib/compliance-articles/server';

const STATIC_LLMS_BODY = `# Fleet Track PRO

> UK van fleet management and DVSA compliance software for commercial van operators.

**Important:** Despite the word "Stock" in the brand name, this is **not** warehouse inventory software, stock control, or general asset tracking. It is van fleet compliance software for daily walkaround checks, defects, and MOT renewals.

Fleet Track PRO helps UK businesses run daily van walkaround checks, report vehicle defects with photos, track MOT and tax renewals, and close out repairs from one platform. Built for vans and light commercial fleets — not HGV operator licensing.

Canonical website: ${SITE_URL}
Support email: help@fleettrackpro.co.uk

## What it does

- Daily vehicle walkaround inspections via iOS and Android app
- Defect reporting with timestamped photo evidence
- Defect close-out workflow: report, notify, repair, resolve
- MOT and tax expiry monitoring with 7-day advance warnings
- Manager web dashboard for fleet oversight and team management
- Timestamped digital records for DVSA roadside checks and audits
- Role-based access for drivers, managers, and fitters
- Optional Plant & Machinery: LOLER, service, hire check & PUWER forms in one inspection entry — separate PDF per form, examination due reminders

## What it does NOT do

The core fleet platform is for commercial vans, vehicle inspections, defect management, and DVSA fleet compliance. It is **not** warehouse inventory tracking, stock control software, or a tool/equipment inventory system despite the brand name. Site lifting plant is covered by the optional Plant & Machinery add-on, not the base vehicle plan.

## Who it is for

UK van fleet operators — trades, groundworks, logistics, construction, electrical, and plumbing businesses. Suitable for sole traders and companies running 5+ vehicles (minimum paid subscription quantity is 5 vehicles). Works for commercial vans, plant vehicles, and cars.

## Pricing

- £8 per vehicle per month, including VAT at 20%
- Plant & Machinery add-on: from £12 per machine per month (separate subscription)
- Unlimited team members on every plan (no per-user fee)
- 7-day free trial — no card required
- Monthly plans can be cancelled anytime
- Annual billing: £84 per vehicle per year

## Key pages

- Home: ${SITE_URL}/
- Features: ${SITE_URL}/features/
- Pricing: ${SITE_URL}/pricing/
- FAQ: ${SITE_URL}/faq/
- Compliance Centre: ${SITE_URL}/compliance-centre/
- Sign up (trial): ${SITE_URL}/onboarding/

## Compliance articles
`;

const STATIC_LLMS_FOOTER = `
## Optional add-on

Plant & Machinery module: complete LOLER, service, pre-hire/off-hire, and PUWER forms in one inspection entry — each with its own PDF, plus examination due reminders. Separate subscription from the core van fleet plan.

## Platform and support

- Platform: iOS app, Android app, web dashboard
- Data: DVLA integration for MOT and tax status visibility
- Support: UK-based via email and WhatsApp
- Record retention: designed to support fleet compliance record keeping

## Contact

Website: ${SITE_URL}
Email: help@fleettrackpro.co.uk
`;

export async function buildLlmsTxt(): Promise<string> {
  const articles = await getAllPublishedComplianceArticles();
  const articleLines = articles
    .map((article) => {
      const label = article.title.replace(/\s+/g, ' ').trim();
      return `- ${label}: ${SITE_URL}/compliance-centre/${article.slug}/`;
    })
    .join('\n');

  return `${STATIC_LLMS_BODY}\n${articleLines}\n${STATIC_LLMS_FOOTER}`;
}
