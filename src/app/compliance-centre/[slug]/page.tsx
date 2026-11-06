import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import ArticleBottomCta from '@/components/ArticleBottomCta';
import ComplianceArticleContent from '@/components/ComplianceArticleContent';
import WalkaroundPhoneCta from '@/components/compliance-articles/WalkaroundPhoneCta';
import DefectReportingLink from '@/components/compliance-articles/DefectReportingLink';
import { ComplianceArticleJsonLd } from '@/components/seo/ComplianceArticleJsonLd';
import { format } from 'date-fns';
import {
  COMPLIANCE_ARTICLES,
  type ComplianceArticle,
} from '@/content/complianceArticles';
import { getStaticComplianceArticle } from '@/lib/compliance-articles/static';
import {
  getAllPublishedComplianceArticles,
  getCmsArticleBySlug,
  getPublishedCmsArticles,
} from '@/lib/compliance-articles/server';
import { polishComplianceMarkdown } from '@/lib/compliance-articles/polish';
import type { ComplianceArticleMeta } from '@/lib/compliance-articles/types';
import CmsComplianceArticleBody from '@/components/CmsComplianceArticleBody';
import { ArticleCta, KeyTakeaways } from '@/components/compliance-articles/ArticleChrome';
import {
  ClosingDefectsReturnToServiceArticle,
  HowLongToKeepFleetRecordsArticle,
  NilDefectReportsArticle,
  PreparingForDvsaRoadsideCheckArticle,
} from '@/components/compliance-articles/NewArticles';
import { absolutePageUrl, canonicalPath } from '@/lib/site';
import { EDITORIAL_TEAM_NAME } from '@/lib/brand';
import {
  complianceMetadataTitle,
  resolveFullDocumentTitle,
} from '@/lib/seo/documentTitles';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-static';
export const revalidate = 3600;

const RELATED_ARTICLE_SLUGS: Record<string, string[]> = {
  'are-daily-van-checks-mandatory-uk-2026': [
    'pre-use-checks-company-vehicles',
    'nil-defect-reports-why-they-matter',
    'preparing-for-dvsa-roadside-check',
    'paper-vs-digital-inspection-sheets',
  ],
  'van-fleet-defect-records': [
    'digital-defect-records-dvsa-scrutiny',
    'closing-defects-return-to-service',
    'preparing-for-dvsa-roadside-check',
    'nil-defect-reports-why-they-matter',
  ],
  'digital-defect-records-dvsa-scrutiny': [
    'van-fleet-defect-records',
    'closing-defects-return-to-service',
    'paper-vs-digital-inspection-sheets',
    'preparing-for-dvsa-roadside-check',
  ],
  'closing-defects-return-to-service': [
    'van-fleet-defect-records',
    'digital-defect-records-dvsa-scrutiny',
    'preparing-for-dvsa-roadside-check',
    'nil-defect-reports-why-they-matter',
  ],
  'preparing-for-dvsa-roadside-check': [
    'van-fleet-defect-records',
    'pre-use-checks-company-vehicles',
    'are-daily-van-checks-mandatory-uk-2026',
    'digital-defect-records-dvsa-scrutiny',
  ],
  'paper-vs-digital-inspection-sheets': [
    'pre-use-checks-company-vehicles',
    'are-daily-van-checks-mandatory-uk-2026',
    'van-fleet-defect-records',
    'digital-defect-records-dvsa-scrutiny',
  ],
  'mot-expiry-tracking-for-fleets': [
    'pre-use-checks-company-vehicles',
    'are-daily-van-checks-mandatory-uk-2026',
    'preparing-for-dvsa-roadside-check',
    'van-fleet-defect-records',
  ],
  'pre-use-checks-company-vehicles': [
    'are-daily-van-checks-mandatory-uk-2026',
    'nil-defect-reports-why-they-matter',
    'preparing-for-dvsa-roadside-check',
    'paper-vs-digital-inspection-sheets',
  ],
  'new-tachograph-rules-for-vans-over-2-5-tonnes-what-fleet-operators-need-to-know-in-2026': [
    'preparing-for-dvsa-roadside-check',
    'pre-use-checks-company-vehicles',
    'mot-expiry-tracking-for-fleets',
    'van-fleet-defect-records',
  ],
};

export async function generateStaticParams() {
  const slugs = new Set(COMPLIANCE_ARTICLES.map((a) => a.slug));
  try {
    const cms = await getPublishedCmsArticles();
    for (const article of cms) {
      if (article.slug) slugs.add(article.slug);
    }
  } catch {
    // App Hosting build has Admin credentials; local/CI without them still ships static articles.
  }
  return [...slugs].map((slug) => ({ slug }));
}

async function resolveArticle(slug: string) {
  const staticArticle = getStaticComplianceArticle(slug);
  if (staticArticle) {
    return { kind: 'static' as const, article: staticArticle };
  }
  const cmsArticle = await getCmsArticleBySlug(slug);
  if (cmsArticle) {
    return { kind: 'cms' as const, article: cmsArticle };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveArticle(slug);
  if (!resolved) return {};
  const article = resolved.article;
  const title = complianceMetadataTitle(slug, article.title);
  const ogTitle = resolveFullDocumentTitle(title);
  return {
    // Short SEO <title>; H1 stays article.title in the page body.
    title,
    description: article.metaDescription,
    authors: [
      {
        name: EDITORIAL_TEAM_NAME,
        url: `${absolutePageUrl('/about')}#editorial-team`,
      },
    ],
    alternates: { canonical: canonicalPath(`/compliance-centre/${slug}`) },
    openGraph: {
      title: ogTitle,
      description: article.metaDescription,
      url: absolutePageUrl(`/compliance-centre/${slug}`),
      siteName: 'Fleet Track PRO',
      locale: 'en_GB',
      type: 'article',
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified ?? article.datePublished,
      // og:image comes from opengraph-image.tsx (do not set images here or it overrides).
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: article.metaDescription,
    },
  };
}

function VanFleetDefectRecordsArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        If you run company vehicles — cars, vans or light commercials — you are responsible for making sure each one
        is safe before it is used. Government guidance on{' '}
        <a
          href="https://www.gov.uk/guidance/carry-out-van-daily-walkaround-checks"
          rel="noopener noreferrer"
          target="_blank"
        >
          daily walkaround checks
        </a>{' '}
        makes that duty clear for van operators, and the same discipline applies across mixed fleets. A{' '}
        <DefectReportingLink>defect record</DefectReportingLink> is your evidence that faults were spotted, reported,
        assessed and dealt with before the vehicle went back on the road.
      </p>

      <h2>Why defect records matter for fleets</h2>
      <p>
        The police and DVSA can stop commercial vehicles at the roadside and inspect them. If a vehicle is dangerous,
        DVSA can stop you using it until the problem is fixed. You may also be fined, prosecuted, or given penalty
        points on your licence. Government guidance states you can receive three penalty points for each tyre that is
        not safe and legal, and that using a vehicle in a dangerous condition can lead to an unlimited fine and a
        prison sentence.
      </p>
      <p>
        DVSA can ask to see a record of your walkaround check during a roadside stop. If a serious defect is found and
        your records do not show that checks are happening, the enforcement outcome is likely to be worse than if you
        can demonstrate a clear process.
      </p>

      <h2>What enforcement can look like in practice</h2>
      <p>
        According to{' '}
        <a
          href="https://www.gov.uk/roadside-vehicle-checks-for-commercial-drivers/roadside-prohibitions"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK guidance on roadside prohibitions
        </a>
        , officers may issue:
      </p>
      <ul>
        <li>
          <strong>Immediate prohibition</strong> — the vehicle cannot be driven until the defect is repaired.
        </li>
        <li>
          <strong>Delayed prohibition</strong> — you may have up to 10 days to fix the issue, depending on severity.
        </li>
        <li>
          <strong>Fixed penalties</strong> — graduated fines, commonly between £50 and £300 for roadworthiness-related
          offences, with more serious cases referred for prosecution.
        </li>
      </ul>
      <p>
        DVSA publishes{' '}
        <a
          href="https://www.gov.uk/government/statistical-data-sets/vehicle-enforcement-data-for-great-britain"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          vehicle enforcement data for Great Britain
        </a>
        , including the most common prohibition defects found at roadside checks. Tyres, brakes, steering and lighting
        feature repeatedly — the same items drivers should be checking before each journey.
      </p>

      <h2>What should a defect record include?</h2>
      <p>
        A useful record should answer five questions without needing a phone call:
      </p>
      <ul>
        <li>Which vehicle was involved?</li>
        <li>Who reported the issue?</li>
        <li>When was it reported?</li>
        <li>What was the issue?</li>
        <li>What happened next?</li>
      </ul>
      <p>
        Government walkaround guidance expects defects found during checks — or during the journey — to be recorded and
        reported. Dangerous defects must be fixed before the journey continues. The responsible person may be a fleet
        manager, mechanic, fitter or another competent person authorised by the business.
      </p>

      <h2>Why an app beats paper for fleets</h2>
      <p>
        Paper booklets can work for a very small fleet if they are completed, collected and stored properly. In practice,
        forms go missing, handwriting is unclear, photos are absent, and managers only learn about defects hours or days
        later. That delay is risky when DVSA stops a vehicle and asks what your maintenance system looks like.
      </p>
      <p>
        A digital inspection app creates timestamped records tied to a named driver, attaches photos at the point of
        reporting, and notifies managers or fitters immediately. That is not just convenience — it is stronger evidence
        that your business checked vehicles before use and acted on faults promptly.
      </p>
      <p>
        Fleet Track PRO is built for this workflow: drivers complete structured inspections in the mobile app, defects
        are raised with photo evidence, and fitters close jobs through a clear status trail managers can review later.
      </p>

      <h2>Keep records factual and consistent</h2>
      <p>
        A good defect record avoids vague language. &quot;Problem with vehicle&quot; is not enough. &quot;Nearside rear
        tyre below safe tread depth, vehicle removed from use, replacement fitted by fitter and signed off before return
        to service&quot; is much stronger. The same principle applies whether you use paper or software: someone outside
        your business should be able to understand the decision made at the time.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Always check current{' '}
        <a
          href="https://www.gov.uk/guidance/carry-out-van-daily-walkaround-checks"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK walkaround guidance
        </a>{' '}
        and DVSA enforcement publications for your own operation.
      </p>

      <KeyTakeaways>
        <li>Fleet operators are responsible for ensuring vehicles are safe before use.</li>
        <li>DVSA can issue prohibitions, fines and penalty points where defects are found at roadside checks.</li>
        <li>Defect records should identify the driver, vehicle, time, fault and close-out action.</li>
        <li>Digital records with timestamps and photos are stronger evidence than lost or late paper forms.</li>
        <li>Consistent daily checks reduce downtime, enforcement risk and repeat defects across the fleet.</li>
      </KeyTakeaways>
      <ArticleCta />
    </ComplianceArticleContent>
  );
}

function PaperVsDigitalArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        Paper inspection sheets have been used by UK fleets for decades, but they are increasingly out of step with how
        modern operators work. Fleet managers need fast <DefectReportingLink>defect reporting</DefectReportingLink>,
        named accountability, photo evidence and searchable records. A paper sheet can capture a tick-box check, but it
        struggles to prove what happened, when it happened and who saw it in time to act.
      </p>

      <h2>The everyday problems with paper inspection sheets</h2>
      <p>
        The most common paper problem is simple: forms go missing. A driver completes a sheet, leaves it in the cab, hands it to the wrong person, or keeps it with other job paperwork until the end of the week. By the time a manager reviews it, the vehicle may have completed several more journeys.
      </p>
      <p>
        Illegible handwriting creates another risk. A defect note written in a hurry can be difficult to read, especially if the form is wet, folded or photographed badly. If the issue later becomes part of an insurance claim, client dispute or DVSA investigation, unclear notes are weak evidence. The same applies to incomplete forms, missing signatures and blank date fields.
      </p>

      <h2>No timestamps, no photos, no accountability</h2>
      <p>
        Paper rarely proves the exact time a check was completed. A handwritten date does not show whether the inspection happened before the journey, after the vehicle returned, or at the end of the week when paperwork was being caught up. Paper also does not naturally attach photos. If a driver says a tyre, mirror or light was damaged, the manager may have no visual evidence of the condition at the point of reporting.
      </p>
      <p>
        Accountability is also weaker. A paper process can show a signature, but it may not reliably show which user submitted which record, who received the alert, when a fitter started the repair, or when the vehicle was released back into service. That gap is where defects get lost.
      </p>

      <h2>What digital inspection software captures</h2>
      <p>
        Digital vehicle inspection software can capture structured data that paper cannot manage well: server timestamps, named user attribution, photo evidence, consistent checklist responses and live notification to managers or fitters. Timestamped digital evidence is already a major improvement over handwritten sheets.
      </p>
      <p>
        Fleet Track PRO requires a 6-photo walkaround covering the front, rear, driver side, passenger side, interior and odometer. Each submission is timestamped and tied to a named user. If a defect is reported, managers and fitters can see the issue quickly instead of waiting for paper to reach the office.
      </p>

      <h2>The enforcement risk of incomplete records</h2>
      <p>
        GOV.UK guidance on{' '}
        <a
          href="https://www.gov.uk/roadside-vehicle-checks-for-commercial-drivers"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          roadside vehicle checks
        </a>{' '}
        states that police and DVSA can issue fines where offences are found, with amounts varying by seriousness.
        Prohibition notices can immobilise a vehicle until defects are repaired. If your inspection records are missing,
        unsigned or completed after the event, it is harder to show that your business operated responsibly.
      </p>
      <p>
        In an insurance claim, employment dispute, customer complaint or court case, the quality of your inspection
        evidence matters. A digital record is not automatically acceptable, but a well-used system creates stronger
        evidence because events are recorded in sequence, linked to users and stored centrally.
      </p>

      <h2>How a digital audit trail works</h2>
      <p>
        A useful digital audit trail shows the whole journey: inspection submitted, defect created, responsible person notified, repair status updated, evidence added and final close-out completed. That sequence is valuable because it shows not only that the fault existed, but that the business had a process for dealing with it.
      </p>
      <p>
        For fleet managers, this also helps day-to-day operations. Instead of checking piles of paper, calling drivers and chasing fitters, the manager can see open defects, vehicle status and historical records from one dashboard. That makes it easier to prioritise safety-critical work and spot repeat problems.
      </p>

      <h2>How much time can digital inspections save?</h2>
      <p>
        Time savings vary by fleet size and process. Digital inspections usually reduce admin by cutting paper
        handovers, scanning, phone chasers, and the time spent finding an old form when someone asks for evidence.
        The bigger gain is often management time: retrieving a specific inspection from months ago is far quicker in a
        searchable system than in a paper archive — and that difference compounds across 20, 50 or 100 vehicles.
      </p>

      <h2>Paper is familiar, but digital is more resilient</h2>
      <p>
        Paper inspection sheets are familiar and low cost at the point of use, but they depend heavily on human discipline. Digital systems do not remove responsibility; they make the responsible process easier to follow. Drivers get a consistent flow, fitters get clearer jobs, and managers get records that can be searched and reviewed without chasing paperwork.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Always check current{' '}
        <a
          href="https://www.gov.uk/roadside-vehicle-checks-for-commercial-drivers"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK roadside check guidance
        </a>{' '}
        for your operation.
      </p>

      <KeyTakeaways>
        <li>Paper inspection sheets are vulnerable to lost forms, illegible notes and delayed reporting.</li>
        <li>Digital inspections create timestamped records with named users and photo evidence.</li>
        <li>A strong audit trail helps during insurance claims, court cases and compliance checks.</li>
        <li>Fleet Track PRO uses a 6-photo walkaround, timestamped submission and named user attribution.</li>
        <li>Digital workflows usually reduce admin for drivers and make historical records easier to retrieve.</li>
      </KeyTakeaways>
      <ArticleCta />
    </ComplianceArticleContent>
  );
}

function MotExpiryTrackingArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        MOT expiry tracking is one of the simplest fleet compliance tasks to understand and one of the easiest to get
        wrong once a company runs more than a handful of cars and vans. A single missed test can take a vehicle off the
        road, disrupt jobs and leave the business open to enforcement. This guide covers how MOT due dates work under
        GOV.UK rules, what happens when a certificate lapses, how to check status online, and a simple monthly routine
        that works for a small fleet.
      </p>

      <h2>How MOT due dates work for vans and cars</h2>
      <p>
        The MOT test checks that a vehicle meets road safety and environmental standards. For most cars and vans
        registered in Great Britain, GOV.UK states that you must get an MOT by either the third anniversary of the
        vehicle&apos;s registration, or the anniversary of its last MOT once the vehicle is over three years old. After
        the first test, an MOT lasts for a year.
      </p>
      <p>
        Light vans follow the same calendar rules as cars for when the first test is due and how often renewals fall.
        For the test itself, GOV.UK classes many vans as class 4 (up to 3,000kg design gross weight, including car-type
        vans) or class 7 (over 3,000kg up to 3,500kg). Maximum fees differ by class, but the due-date logic for a typical
        company car or van is the same: first test by three years from registration, then annually.
      </p>
      <p>
        A small number of vehicle types need testing from one year old — GOV.UK tells you to check the MOT fees table if
        you are unsure. Northern Ireland has different MOT rules and processes for vehicles registered there, so treat
        NI fleets as a separate checklist.
      </p>
      <p>
        You can book an MOT up to a month (minus a day) before the current certificate runs out and keep the same renewal
        date for the following year. If you test earlier than that window, the next expiry moves to one year (minus a
        day) from the new pass date. That matters for fleets: booking inside the keep-same-date window avoids drifting
        renewal months and keeps planning predictable.
      </p>

      <h2>The first-MOT-at-3-years rule</h2>
      <p>
        New cars and most new vans do not need an MOT until the third anniversary of registration. Until then there is
        no annual MOT certificate to track — but the first due date still needs a diary entry as soon as the vehicle
        joins the fleet. Missing that first anniversary is a common way a nearly-new company van ends up on the road
        without a valid test.
      </p>
      <p>
        In practice, record the registration date (or first registration from the V5C) when you add the vehicle, calculate
        the third anniversary, and set reminders well before that day. Once the first MOT is passed, switch the tracking
        target to the certificate expiry shown on GOV.UK and on the MOT certificate. Do not assume &quot;it is new, so it
        is fine&quot; without a dated first-test plan.
      </p>

      <h2>What happens if an MOT lapses</h2>
      <p>
        GOV.UK is clear: you cannot drive or park the vehicle on the road once the MOT has run out, and you can be
        prosecuted if caught. The fine for driving without a valid MOT is up to £1,000. The only exceptions GOV.UK lists
        are driving to or from somewhere to be repaired, and driving to a pre-arranged MOT test.
      </p>
      <p>
        There is a tax knock-on as well. You cannot renew vehicle tax while the MOT has expired. If tax is due to run out
        at the same time, GOV.UK says to register the vehicle as off the road (SORN), book an MOT, then tax it once it
        has passed. That sequence matters for fleets that keep vehicles parked between jobs — an expired MOT still blocks
        normal taxing.
      </p>
      <p>
        Today the no-MOT offence is fine-only, with no licence points under current rules. A 2026 government consultation
        asked whether points or seizure should be added; until any change becomes law, the GOV.UK position remains the
        fine and the ban on using the vehicle on the road. For fleet managers who need the latest on penalties and
        employer liability, see our separate guide on{' '}
        <Link href="/compliance-centre/penalty-points-for-no-mot/">
          penalty points for no MOT
        </Link>
        .
      </p>
      <p>
        Downtime is often the bigger commercial cost. An urgent test after a lapse can disrupt deliveries and customer
        work even when the vehicle would otherwise pass. If the test finds a dangerous defect, GOV.UK rules on driving
        after a fail are stricter still — so keeping dates ahead of expiry is cheaper than recovering from a lapse.
      </p>

      <h2>Checking MOT status on GOV.UK</h2>
      <p>
        For any registration plate you can use the free GOV.UK services. Use{' '}
        <a
          href="https://www.gov.uk/check-mot-status"
          rel="noopener noreferrer"
          target="_blank"
        >
          Check the MOT status of a vehicle
        </a>{' '}
        to see whether there is a current MOT and when it runs out. Use{' '}
        <a
          href="https://www.gov.uk/check-mot-history"
          rel="noopener noreferrer"
          target="_blank"
        >
          Check the MOT history of a vehicle
        </a>{' '}
        for past results, mileage recorded at test, advisories and when the next MOT is due. You only need the number
        plate.
      </p>
      <p>
        GOV.UK also offers free MOT reminders by text or email about a month before a car or van MOT is due. Those
        personal reminders help drivers and sole traders; a fleet still needs one shared view of every plate so cover and
        bookings are not left to individual inboxes.
      </p>
      <p>
        Software does not replace those official checks. It reduces the chance that a spreadsheet or memory is the only
        record. Fleet Track PRO&apos;s{' '}
        <Link href="/fleet-mot-tax-reminders/">MOT and tax reminders</Link> surface DVLA-backed MOT and tax status on
        each vehicle record and send advance warnings so managers can book inside the keep-same-date window instead of
        reacting after expiry.
      </p>

      <h2>A simple monthly routine for a small fleet</h2>
      <p>
        For a small fleet — say under twenty cars and vans — a light monthly rhythm beats a complex process nobody
        follows. Once a month, on a fixed day, open your vehicle list and work through every registration that has an MOT
        due in the next 60 days. Confirm each date against GOV.UK if anything looks stale (new purchase, recent test, or a
        vehicle that failed and was retested). Book tests inside the month-minus-a-day window where you want to keep the
        renewal date. Note any advisories from the last certificate and fold them into maintenance before they become
        fails.
      </p>
      <p>
        In the same pass, check tax status for the same vehicles, because MOT and tax often collide. If a vehicle will
        not be used and the MOT has already lapsed, follow the GOV.UK sequence: SORN if needed, book the test, tax after
        a pass. Keep one named owner for renewals so cover is arranged when someone is away.
      </p>
      <p>
        Between MOT dates, daily walkaround checks and{' '}
        <DefectReportingLink>defect</DefectReportingLink> close-out still matter. An MOT is a point-in-time test; it does
        not cover the whole year. If a van fails because of a fault that should have been reported earlier, the missed
        process is as serious as the missed booking.
      </p>

      <h2>Why spreadsheets fail once the fleet grows</h2>
      <p>
        A spreadsheet can work for a very small fleet if one person updates it every time. Vehicles are added, sold,
        hired and replaced; MOT dates change after early or late tests; tax status changes. Shared sheets drift when
        someone keeps a local copy or a calendar reminder is not updated after a retest. By the time the error is
        noticed, the vehicle may already be outside the legal window.
      </p>

      <h2>How Fleet Track PRO supports the routine</h2>
      <p>
        Fleet Track PRO shows MOT and tax status on every vehicle card and sends automatic alerts before expiry,
        including 7-day advance warnings, so there is time to book and arrange cover. Renewals sit beside inspections and
        defects, so managers see whether a vehicle is active, in maintenance, due for renewal or blocked by an open
        defect without jumping between tools.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles based on GOV.UK guidance current at the time of writing and is not
        legal advice. Always check current MOT and tax rules on{' '}
        <a
          href="https://www.gov.uk/getting-an-mot"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK
        </a>{' '}
        for your vehicles.
      </p>

      <KeyTakeaways>
        <li>Most cars and vans need a first MOT by the third anniversary of registration, then every year.</li>
        <li>
          You can test up to a month (minus a day) early and keep the same renewal date; earlier tests move the expiry.
        </li>
        <li>
          Driving or parking on the road without a valid MOT can mean a fine of up to £1,000; tax cannot be renewed while
          the MOT is expired.
        </li>
        <li>Check status and history on GOV.UK with the registration plate, and run a monthly 60-day renewal review.</li>
        <li>Fleet Track PRO surfaces MOT and tax status per vehicle with advance warnings so bookings stay ahead of expiry.</li>
      </KeyTakeaways>
      <ArticleCta />
    </ComplianceArticleContent>
  );
}

function PreUseChecksArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        A pre-use check is the inspection a driver completes before operating a company vehicle. For UK fleet
        operators, it is one of the most practical ways to show that vehicles are checked for obvious defects before
        they go on the road. The check does not replace scheduled maintenance or an MOT, but it creates a daily record
        that a responsible person looked at the vehicle at the point of use. Government guidance on{' '}
        <a
          href="https://www.gov.uk/guidance/carry-out-van-daily-walkaround-checks"
          rel="noopener noreferrer"
          target="_blank"
        >
          daily walkaround checks
        </a>{' '}
        sets out that duty clearly for vans, and the same pre-use discipline applies across company fleets.
      </p>

      <h2>What should a driver check?</h2>
      <p>
        Guidance varies by vehicle type and operator policy, but a sensible pre-use check usually covers visibility,
        lights, tyres, brakes, steering, mirrors, windscreen condition, fluid leaks, and load security where relevant.
        Drivers should also confirm the vehicle is roadworthy for the journey — not just that it starts.
      </p>
      <p>
        The check should be completed before the vehicle is used for work, not at the end of the day when problems may
        already have caused damage or delay. If a defect is found, the driver should report it and the vehicle should
        not be used until a competent person has assessed it.
      </p>

      <h2>Who is responsible?</h2>
      <p>
        The driver completing the check is responsible for carrying it out honestly. The operator is responsible for
        having a system that ensures checks happen, defects are recorded, and unsafe vehicles are not knowingly kept in
        service. Transport managers, fleet managers, and site supervisors often oversee whether the process is working
        in practice.
      </p>

      <h2>What records should you keep?</h2>
      <p>
        A useful record identifies the driver, date and time, vehicle registration, checklist responses, and any{' '}
        <DefectReportingLink>defects</DefectReportingLink> reported. Photos help where there is damage, tyre wear, or a
        lighting fault. If the record only says &quot;all OK&quot; with no name and no timestamp, it is weak evidence
        when something goes wrong later. For the full defect trail after a fault is found, see{' '}
        <Link href="/compliance-centre/van-fleet-defect-records/">fleet defect records</Link>.
      </p>

      <h2>How often should checks happen?</h2>
      <p>
        Many operators require a check at the start of each working day or before each shift when the vehicle is used.
        If a vehicle is shared between drivers, each user should understand whether a fresh check is required when they
        take over. Consistency matters more than the exact label on the form.
      </p>
      <p>
        Fleet Track PRO uses a structured mobile inspection flow with required photos and checklist items, so drivers
        cannot skip steps and managers see new defects without waiting for paperwork.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Follow current{' '}
        <a
          href="https://www.gov.uk/guidance/carry-out-van-daily-walkaround-checks"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK walkaround guidance
        </a>{' '}
        and employer policy for your operation.
      </p>

      <KeyTakeaways>
        <li>Pre-use checks should happen before the vehicle is used for work, not after.</li>
        <li>Records should identify the driver, vehicle, time, and any defects reported.</li>
        <li>Operators need a system to act on defects — not just collect forms.</li>
        <li>Digital checks improve speed, photo evidence, and manager visibility.</li>
      </KeyTakeaways>
      <ArticleCta />
    </ComplianceArticleContent>
  );
}

function DigitalDefectRecordsDvsaArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        When DVSA examines an operator&apos;s maintenance system, they are not only looking at whether a single vehicle
        was roadworthy on one day. They want evidence of a working process: checks are completed, defects are reported,
        repairs are recorded, and unsafe vehicles are taken out of use until resolved.{' '}
        <DefectReportingLink>Digital defect records</DefectReportingLink> can support that story — but only if they are
        accurate, consistent, and used as part of a real workflow.
      </p>

      <h2>What examiners look for in the trail</h2>
      <p>
        A credible record answers basic questions without guesswork: which vehicle, who reported the issue, when it was
        reported, what the defect was, who reviewed it, what action was taken, and when the vehicle returned to
        service. Vague notes such as &quot;brake noise&quot; without context are easier to challenge than a clear
        description with supporting photos and a repair trail.
      </p>
      <p>
        For more on what to capture day to day, see our guide on{' '}
        <Link href="/compliance-centre/van-fleet-defect-records/">
          fleet defect records
        </Link>
        . This article focuses on how that trail holds up when an examiner asks harder questions.
      </p>

      <h2>Roadside findings that trigger follow-up</h2>
      <p>
        At the roadside, an examiner may find a defect that should have been visible during a recent check. If your
        records show no defect and no inspection around that period, you may be asked how your maintenance system works.
        If your records show a defect was reported, the vehicle was marked out of use, and repair was signed off before
        return to service, that is a much stronger position — even when the stop still results in a prohibition for the
        fault found on the day.
      </p>
      <p>
        Follow-up can also look beyond one vehicle. Patterns across the fleet matter: repeated tyre or lighting defects,
        gaps between inspection dates, or vehicles that stay &quot;active&quot; while defects remain open all invite
        deeper questions about whether the written system matches reality.
      </p>

      <h2>What operators should avoid</h2>
      <p>
        Backdating checks, completing forms in bulk at the end of the week, or closing defects without evidence of repair
        undermines both paper and digital systems. Inspectors are interested in patterns. If every vehicle shows
        &quot;no defects&quot; every day while serious faults appear at roadside stops, the record-keeping system will
        be questioned — regardless of whether the forms are paper or digital.
      </p>
      <p>
        Digital tools do not make records automatically acceptable. Examiners can still ask whether drivers were
        trained, whether managers acted on alerts, and whether the process was used consistently across the fleet.
      </p>

      <h2>Using software as part of compliance culture</h2>
      <p>
        Fleet Track PRO supports defect reporting with timestamped submissions, photo evidence, workflow status from
        open to resolved, and manager visibility on the web dashboard. The software does not replace operator
        responsibility, but it makes good practice easier to follow and easier to demonstrate when evidence is
        requested.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Always check current{' '}
        <a
          href="https://www.gov.uk/roadside-vehicle-checks-for-commercial-drivers"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK roadside check guidance
        </a>{' '}
        for your operation.
      </p>

      <KeyTakeaways>
        <li>DVSA looks for a working maintenance process, not isolated forms.</li>
        <li>Credible trails show report → assessment → repair → return to service.</li>
        <li>Patterns across the fleet matter as much as any single record.</li>
        <li>Software helps when it is used honestly as part of daily fleet routine.</li>
      </KeyTakeaways>
      <ArticleCta />
    </ComplianceArticleContent>
  );
}

function ArticleBody({ article }: { article: ComplianceArticle }) {
  switch (article.slug) {
    case 'van-fleet-defect-records':
      return <VanFleetDefectRecordsArticle />;
    case 'paper-vs-digital-inspection-sheets':
      return <PaperVsDigitalArticle />;
    case 'mot-expiry-tracking-for-fleets':
      return <MotExpiryTrackingArticle />;
    case 'pre-use-checks-company-vehicles':
      return <PreUseChecksArticle />;
    case 'digital-defect-records-dvsa-scrutiny':
      return <DigitalDefectRecordsDvsaArticle />;
    case 'nil-defect-reports-why-they-matter':
      return <NilDefectReportsArticle />;
    case 'how-long-to-keep-fleet-records':
      return <HowLongToKeepFleetRecordsArticle />;
    case 'closing-defects-return-to-service':
      return <ClosingDefectsReturnToServiceArticle />;
    case 'preparing-for-dvsa-roadside-check':
      return <PreparingForDvsaRoadsideCheckArticle />;
    default:
      return null;
  }
}

export default async function ComplianceArticlePage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveArticle(slug);
  if (!resolved) notFound();

  const allArticles = await getAllPublishedComplianceArticles();
  const preferredSlugs = RELATED_ARTICLE_SLUGS[slug] ?? [];
  const preferred = preferredSlugs
    .map((preferredSlug) => allArticles.find((article) => article.slug === preferredSlug))
    .filter((article): article is ComplianceArticleMeta => Boolean(article));
  const related = [
    ...preferred,
    ...allArticles.filter(
      (article) =>
        article.slug !== slug &&
        !preferred.some((preferredArticle) => preferredArticle.slug === article.slug)
    ),
  ];
  const articleMeta: ComplianceArticleMeta =
    resolved.kind === 'static'
      ? { ...resolved.article, source: 'static' }
      : resolved.article;

  return (
    <div className="marketing-shell">
      <ComplianceArticleJsonLd article={articleMeta} />
      <Navbar />
      <main>
        <div className="mkt-container pt-24 sm:pt-28 pb-20 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 lg:gap-10">
            <article className="mkt-card-static p-6 sm:p-10">
              <p className="mkt-eyebrow mb-4">
                <Link href="/compliance-centre/" className="hover:underline">
                  Compliance Centre
                </Link>
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--mkt-ink)] mb-3 leading-tight">
                {articleMeta.title}
              </h1>
              <p className="mb-2 text-sm text-[var(--mkt-muted)]">
                Published{' '}
                {format(new Date(articleMeta.datePublished), 'd MMMM yyyy')}
                {articleMeta.dateModified && articleMeta.dateModified !== articleMeta.datePublished
                  ? ` · Updated ${format(new Date(articleMeta.dateModified), 'd MMMM yyyy')}`
                  : ''}
              </p>
              <p className="mb-8 sm:mb-10 text-sm text-[var(--mkt-muted)]">
                By{' '}
                <Link
                  href="/about/#editorial-team"
                  rel="author"
                  className="font-medium text-[var(--mkt-ink)] underline underline-offset-4 hover:text-[var(--brand-blue)]"
                >
                  {EDITORIAL_TEAM_NAME}
                </Link>
              </p>
              {resolved.kind === 'static' ? (
                <ArticleBody article={resolved.article} />
              ) : (
                <CmsComplianceArticleBody
                  markdown={polishComplianceMarkdown(resolved.article.bodyMarkdown, true)}
                />
              )}
              <WalkaroundPhoneCta />
              <ArticleBottomCta />
            </article>

            <aside className="lg:sticky lg:top-28 h-fit space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-slate-900 font-semibold mb-2">Try the platform</p>
                <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                  See how inspections, defects, and reminders come together for UK fleets.
                </p>
                <Link
                  href="/onboarding/?start=1"
                  className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white"
                >
                  Start free 14-day trial →
                </Link>
              </div>
              {related.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-slate-900 font-semibold mb-3">Related articles</p>
                  <ul className="space-y-3">
                    {related.slice(0, 4).map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/compliance-centre/${r.slug}/`}
                          className="text-sm text-slate-700 hover:text-[var(--brand-blue)] leading-snug block"
                        >
                          {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
