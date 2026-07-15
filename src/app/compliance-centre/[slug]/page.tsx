import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import ArticleBottomCta from '@/components/ArticleBottomCta';
import ComplianceArticleContent from '@/components/ComplianceArticleContent';
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
} from '@/lib/compliance-articles/server';
import { polishComplianceMarkdown } from '@/lib/compliance-articles/polish';
import type { ComplianceArticleMeta } from '@/lib/compliance-articles/types';
import CmsComplianceArticleBody from '@/components/CmsComplianceArticleBody';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export function generateStaticParams() {
  return COMPLIANCE_ARTICLES.map((a) => ({ slug: a.slug }));
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
  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: `/compliance-centre/${slug}` },
    openGraph: {
      title: `${article.title} | Fleet Track PRO`,
      description: article.metaDescription,
      url: `https://www.fleettrackpro.co.uk/compliance-centre/${slug}`,
      siteName: 'Fleet Track PRO',
      locale: 'en_GB',
      type: 'article',
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified ?? article.datePublished,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | Fleet Track PRO`,
      description: article.metaDescription,
    },
  };
}

function KeyTakeaways({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-12 rounded-2xl border border-slate-200 bg-blue-500/10 p-6 sm:p-8">
      <h2 className="mb-5 text-xl font-semibold text-slate-900">Key takeaways</h2>
      <ul className="compliance-takeaway-list space-y-3">{children}</ul>
    </div>
  );
}

function ArticleCta() {
  return (
    <div className="mt-10 rounded-2xl border border-slate-200 bg-white/[0.04] p-6 sm:p-7">
      <p className="text-base leading-relaxed text-slate-700">
        <span className="font-medium text-slate-900">Fleet Track PRO</span> helps automate this process for UK fleets.{' '}
        <Link href="/onboarding" className="text-blue-300 hover:text-blue-200 underline underline-offset-4">
          Try free for 7 days — no card required.
        </Link>
      </p>
    </div>
  );
}

function VanFleetDefectRecordsArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        If you run commercial vans, you are responsible for making sure each vehicle is safe before it is used.
        Government guidance on{' '}
        <a
          href="https://www.gov.uk/guidance/carry-out-van-daily-walkaround-checks"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          van daily walkaround checks
        </a>{' '}
        makes that duty clear. A defect record is your evidence that faults were spotted, reported, assessed and dealt
        with before the van went back on the road.
      </p>

      <h2>Why defect records matter for van fleets</h2>
      <p>
        The police and DVSA can stop vans at the roadside and inspect them. If a vehicle is dangerous, DVSA can stop
        you using it until the problem is fixed. You may also be fined, prosecuted, or given penalty points on your
        licence. Government guidance states you can receive three penalty points for each tyre that is not safe and
        legal, and that using a van in a dangerous condition can lead to an unlimited fine and a prison sentence.
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

      <h2>Why an app beats paper for van fleets</h2>
      <p>
        Paper booklets can work for a very small fleet if they are completed, collected and stored properly. In practice,
        forms go missing, handwriting is unclear, photos are absent, and managers only learn about defects hours or days
        later. That delay is risky when DVSA stops a vehicle and asks what your maintenance system looks like.
      </p>
      <p>
        A van inspection app creates timestamped records tied to a named driver, attaches photos at the point of
        reporting, and notifies managers or fitters immediately. That is not just convenience — it is stronger evidence
        that your business checked vehicles before use and acted on faults promptly.
      </p>
      <p>
        Fleet Track PRO is built for this workflow: drivers complete structured inspections in the mobile app, defects
        are raised with photo evidence, and fitters close jobs through a clear status trail managers can review later.
      </p>

      <h2>Keep records factual and consistent</h2>
      <p>
        A good defect record avoids vague language. &quot;Problem with van&quot; is not enough. &quot;Nearside rear tyre
        below safe tread depth, vehicle removed from use, replacement fitted by fitter and signed off before return to
        service&quot; is much stronger. The same principle applies whether you use paper or software: someone outside
        your business should be able to understand the decision made at the time.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Always check current{' '}
        <a
          href="https://www.gov.uk/guidance/carry-out-van-daily-walkaround-checks"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK van walkaround guidance
        </a>{' '}
        and DVSA enforcement publications for your own operation.
      </p>

      <KeyTakeaways>
        <li>Van operators are responsible for ensuring vehicles are safe before use.</li>
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
        Paper inspection sheets have been used by UK fleets for decades, but they are increasingly out of step with how modern operators work. Fleet managers need fast defect reporting, named accountability, photo evidence and searchable records. A paper sheet can capture a tick-box check, but it struggles to prove what happened, when it happened and who saw it in time to act.
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
        Prohibition notices can immobilise a van until defects are repaired. If your inspection records are missing,
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
        MOT expiry tracking is one of the simplest fleet compliance tasks to understand and one of the easiest to get wrong at scale. A single missed MOT can take a vehicle off the road, create customer disruption and expose the business to enforcement action. When a company runs multiple vans, plant vehicles or mixed light-commercial assets, relying on memory or a spreadsheet becomes a risk.
      </p>

      <h2>Why expired MOTs are high risk</h2>
      <p>
        In the UK, driving a vehicle without a valid MOT can lead to a fine of up to £1,000. If the vehicle is also in a dangerous condition, the consequences can be more serious. An expired MOT may also affect insurance, especially if a vehicle involved in an incident was not legally roadworthy or should not have been used.
      </p>
      <p>
        For commercial van operators, the risk goes beyond the single vehicle. A roadside stop, customer complaint or collision can trigger wider scrutiny of maintenance records. If a fleet manager cannot show that renewals are monitored and vehicles are kept roadworthy, DVSA may ask harder questions about the business&apos;s compliance culture.
      </p>

      <h2>Potential prohibition notices and downtime</h2>
      <p>
        DVSA examiners can issue prohibition notices where a vehicle is unroadworthy or presents a serious defect. An expired MOT is not the same as a mechanical defect, but it can be part of a wider compliance failure if the vehicle should not have been on the road or if maintenance records are weak. Even where the vehicle is otherwise safe, arranging an urgent MOT at short notice can disrupt jobs, deliveries and customer commitments.
      </p>

      <h2>Why spreadsheets fail at scale</h2>
      <p>
        A spreadsheet can work for a very small fleet if one person updates it perfectly. The problem is that fleets change. Vehicles are added, sold, hired, replaced, assigned to different drivers and moved between sites. MOT dates change after tests. Tax status can change. A spreadsheet only stays accurate if someone checks every record and updates every cell at the right time.
      </p>
      <p>
        The risk increases when several people rely on the same sheet. One manager may sort a column and break a formula. Another may keep a local copy. A reminder may be set in a calendar but not updated when a booking changes. By the time the error is noticed, the renewal window may already have passed.
      </p>

      <h2>How DVLA data integration works</h2>
      <p>
        Modern MOT tracking software can reduce manual checking by using DVLA data. In a typical workflow, the software stores the vehicle registration plate and queries official vehicle data to return current MOT and tax status. The result is displayed against the vehicle record so managers can see upcoming expiry dates without manually searching each registration on a public checker.
      </p>
      <p>
        This does not remove the operator&apos;s responsibility to keep vehicles legal and roadworthy, but it reduces the chance that an outdated spreadsheet becomes the only source of truth. It also makes checks easier to repeat across the fleet, which matters when vehicles are added or changed regularly.
      </p>

      <h2>Why 7-day advance warnings matter</h2>
      <p>
        A reminder on the day an MOT expires is often too late. Fleet managers need time to book a test, arrange cover, move jobs, notify drivers and handle repairs if the vehicle fails. A 7-day advance warning gives the business a practical window to act before the vehicle becomes unavailable or non-compliant.
      </p>
      <p>
        For larger fleets, reminders should go to people who can act. If a warning sits in one person&apos;s inbox while they are away, the system still fails. A better approach is to show expiry risk on the vehicle card, in the manager dashboard and through alerts that fit the team&apos;s daily workflow.
      </p>

      <h2>How Fleet Track PRO handles MOT and tax tracking</h2>
      <p>
        Fleet Track PRO displays MOT and tax status on every vehicle card so managers can review compliance while looking at the fleet. The platform uses DVLA data to support automatic MOT and tax status visibility by registration plate. It also sends automatic alerts before expiry, including 7-day advance warnings, so managers have time to book renewals instead of reacting after the deadline.
      </p>
      <p>
        The benefit is that MOT and tax tracking sit alongside inspections, defects and vehicle status. A manager can see whether a vehicle is active, in maintenance, due for renewal or affected by an open defect without moving between separate spreadsheets and browser tabs.
      </p>

      <h2>Build renewals into the weekly fleet routine</h2>
      <p>
        The best systems combine automation with routine. Managers should still review upcoming renewals weekly, confirm bookings, and check that failed MOTs or advisory items are followed up. Software reduces missed dates, but accountability remains with the operator.
      </p>
      <p>
        For commercial van fleets, this routine is part of the wider maintenance system. MOT tracking, daily inspections and defect close-out should support each other. If a vehicle fails an MOT because of a defect that should have been picked up earlier, the issue is not just the missed test; it is the process that allowed the fault to continue.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Always check current MOT and tax rules on{' '}
        <a
          href="https://www.gov.uk/check-mot-history"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK
        </a>{' '}
        for your vehicles.
      </p>

      <KeyTakeaways>
        <li>Driving without a valid MOT can lead to a fine of up to £1,000 and may affect insurance.</li>
        <li>Spreadsheets become risky when vehicles, dates and responsibilities change across a fleet.</li>
        <li>DVLA data integration helps keep MOT and tax status visible by registration plate.</li>
        <li>7-day advance warnings give managers time to book renewals before vehicles become non-compliant.</li>
        <li>Fleet Track PRO shows MOT and tax status on every vehicle card and sends automatic alerts before expiry.</li>
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
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          van daily walkaround checks
        </a>{' '}
        sets out that duty clearly.
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
        A useful record identifies the driver, date and time, vehicle registration, checklist responses, and any defects
        reported. Photos help where there is damage, tyre wear, or a lighting fault. If the record only says
        &quot;all OK&quot; with no name and no timestamp, it is weak evidence when something goes wrong later. For the
        full defect trail after a fault is found, see{' '}
        <Link href="/compliance-centre/van-fleet-defect-records" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4">
          van fleet defect records
        </Link>
        .
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
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK van walkaround guidance
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
        repairs are recorded, and unsafe vehicles are taken out of use until resolved. Digital defect records can
        support that story — but only if they are accurate, consistent, and used as part of a real workflow.
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
        <Link href="/compliance-centre/van-fleet-defect-records" className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4">
          van fleet defect records
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
        Follow-up can also look beyond one van. Patterns across the fleet matter: repeated tyre or lighting defects,
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

function PlantArticleCta() {
  return (
    <div className="mt-10 rounded-2xl border border-slate-200 bg-white/[0.04] p-6 sm:p-7">
      <p className="text-base leading-relaxed text-slate-700">
        Fleet Track PRO&apos;s optional{' '}
        <span className="font-medium text-slate-900">Plant &amp; Machinery</span> module lets fitters complete multiple
        forms in one inspection entry — LOLER, service, pre-hire/off-hire, and PUWER — each with its own PDF report and
        manager alerts when examinations are due. From £12 per machine per month (min 3).{' '}
        <Link href="/pricing" className="text-blue-300 hover:text-blue-200 underline underline-offset-4">
          See plant pricing
        </Link>{' '}
        or{' '}
        <Link href="/onboarding" className="text-blue-300 hover:text-blue-200 underline underline-offset-4">
          start your 7-day fleet trial
        </Link>
        .
      </p>
    </div>
  );
}

function LolerThoroughExaminationRecordsArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        If your business uses lifting equipment on site — excavators with lifting accessories, telehandlers, MEWPs,
        hoists, or slings and shackles — the{' '}
        <a
          href="https://www.hse.gov.uk/work-equipment/loler/the-law.htm"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          Lifting Operations and Lifting Equipment Regulations 1998 (LOLER)
        </a>{' '}
        apply. A thorough examination is a statutory inspection by a competent person. The report is your evidence that
        the equipment was examined and whether it is safe to continue in use.
      </p>

      <h2>What a thorough examination is — and what it is not</h2>
      <p>
        HSE defines a thorough examination as a detailed visual examination and functional checks carried out by a
        competent person. It is separate from routine maintenance, operator pre-use checks, or a general service. Those
        activities matter for safety, but they do not replace the statutory LOLER examination or the report that must
        follow it.
      </p>
      <p>
        According to{' '}
        <a
          href="https://www.hse.gov.uk/work-equipment/loler/examination-of-lifting-equipment.htm"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          HSE guidance on examination of lifting equipment
        </a>
        , equipment must be thoroughly examined before first use, after installation or assembly at a new site, and
        then at regular intervals. For equipment used for lifting persons, the maximum interval is normally six months.
        For other lifting equipment, the maximum is normally twelve months, unless a written examination scheme specifies
        a different interval.
      </p>

      <h2>What the report of thorough examination must contain</h2>
      <p>
        HSE guidance on{' '}
        <a
          href="https://www.hse.gov.uk/work-equipment/loler/report-thorough-examination-lifting-equipment.htm"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          reports of thorough examination
        </a>{' '}
        sets out what the competent person must record. The report should identify the equipment, state the date of
        examination, give the date of the next thorough examination, and list any defects or matters that could become
        dangerous. If a defect poses an immediate risk, the report must be sent to the relevant enforcing authority as
        well as the person using the equipment.
      </p>
      <p>
        For site managers, the practical point is simple: you need the current report available when asked — during an
        HSE visit, a client audit, or an insurance review — and you need to know when the next examination is due before
        the certificate lapses.
      </p>

      <h2>How long LOLER records should be kept</h2>
      <p>
        HSE states that reports of thorough examination must be kept until the next report is issued for that equipment.
        For lifting accessories, reports should be kept for at least two years. Many operators keep records longer because
        audits, disputes, and insurance claims can reference equipment history well after the next examination is
        completed.
      </p>
      <p>
        Paper certificates stored in site cabins are vulnerable to the same problems as paper vehicle inspection sheets:
        lost files, water damage, and no central copy when a manager is off site. A digital register with downloadable
        PDF reports makes it easier to retrieve the right certificate quickly.
      </p>

      <h2>Who is responsible on site</h2>
      <p>
        LOLER places duties on employers and people who control lifting equipment. That usually means the business
        operating the plant, not only the hire company or the examiner. If you hire equipment, you still need to satisfy
        yourself that thorough examinations are in date and that defects are acted on before use continues.
      </p>
      <p>
        Pre-hire and off-hire checks are useful operational controls, especially when equipment moves between sites, but
        they complement — rather than replace — the statutory examination record.
      </p>

      <h2>How Fleet Track PRO supports LOLER records</h2>
      <p>
        The optional Plant &amp; Machinery module lets managers register machines with examination due dates and usual
        locations. On site, a fitter or manager starts one inspection entry and can complete the forms needed for that
        visit — including LOLER thorough examination, service inspection, pre-hire or off-hire checks, and PUWER — in a
        single submission. Each selected form generates its own PDF, stored against the same inspection reference on the
        web dashboard. Records are retained for at least two years to support LOLER compliance. Managers receive push
        reminders when an examination is due within seven days or overdue.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Always refer to current{' '}
        <a
          href="https://www.hse.gov.uk/work-equipment/loler/"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          HSE LOLER guidance
        </a>{' '}
        for your equipment and operation.
      </p>

      <KeyTakeaways>
        <li>LOLER thorough examinations are statutory — not the same as a routine service or pre-use check.</li>
        <li>Intervals are typically six months for equipment lifting persons and twelve months for other lifting equipment.</li>
        <li>Reports must identify defects, state the next due date, and be kept until superseded.</li>
        <li>Site managers need current PDF reports and a clear view of upcoming due dates.</li>
      </KeyTakeaways>
      <PlantArticleCta />
    </ComplianceArticleContent>
  );
}

function PlantMachineryServiceVsLolerArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        Groundworks, construction, and trades businesses often run a mix of owned and hired plant. Daily operations
        depend on service schedules, fitter visits, and quick pre-start checks. LOLER adds a separate layer: a statutory
        thorough examination with a formal report. Treating a service invoice or a tick-sheet as your LOLER evidence is
        a common — and risky — mistake.
      </p>

      <h2>Routine service and maintenance</h2>
      <p>
        Manufacturers and hire companies set service intervals for filters, fluids, wear parts, and general mechanical
        condition. That work keeps plant reliable and is part of good asset management. HSE expects lifting equipment to
        be maintained, but maintenance records alone do not prove that a competent person has completed a thorough
        examination under LOLER.
      </p>
      <p>
        A service may identify faults, but unless it is carried out as a thorough examination by a competent person and
        documented in a LOLER report, it does not reset your statutory examination cycle or replace the certificate you
        may be asked to produce.
      </p>

      <h2>Pre-use and pre-hire checks</h2>
      <p>
        Operators and site supervisors should check plant before use — controls, leaks, pins, hoses, stabilisers, and
        anything visibly unsafe. Pre-hire and off-hire inspections are especially valuable when equipment arrives from a
        hire company or moves between jobs. These checks reduce the chance that obviously dangerous plant is used.
      </p>
      <p>
        Again, HSE is clear that pre-use checks are not a substitute for thorough examination. They are part of the
        overall safety system. Your LOLER report is the document that confirms the equipment was examined within the
        required interval and whether it is safe to continue in use.
      </p>

      <h2>LOLER thorough examination</h2>
      <p>
        The thorough examination is carried out by a competent person — often a specialist examiner — who assesses the
        equipment against LOLER requirements. The output is a report of thorough examination, not a generic job sheet.
        That report drives your next due date and may trigger immediate action if a serious defect is found.
      </p>
      <p>
        For equipment used to lift persons, such as some MEWPs and man-riding attachments, the examination interval is
        typically six months. For much other lifting equipment, twelve months is the usual maximum unless your
        examination scheme states otherwise. See{' '}
        <a
          href="https://www.hse.gov.uk/work-equipment/loler/examination-of-lifting-equipment.htm"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          HSE guidance on examination intervals
        </a>{' '}
        for detail.
      </p>

      <h2>Why conflating them creates compliance risk</h2>
      <p>
        If a machine has been serviced recently but the LOLER certificate expired last month, the plant may still be
        non-compliant. If an examiner raised a defect and the report was filed in a van glove box while the machine
        stayed on hire, you may not have a defensible process. Auditors and clients increasingly ask for the actual LOLER
        PDF, not assurances that &quot;the fitter looked at it last week.&quot;
      </p>
      <p>
        Strong operators keep three threads visible: service history, daily or pre-hire checks, and the current thorough
        examination report with its next due date. Software helps when each type of record is stored against the same
        machine register instead of scattered across email, paper, and different spreadsheets.
      </p>

      <h2>How Fleet Track PRO keeps each record type distinct in one visit</h2>
      <p>
        The Plant &amp; Machinery module is built for real site work: one inspection entry, multiple forms. A fitter can
        complete a LOLER thorough examination, a service inspection, and a pre-hire or off-hire check in the same
        submission when all three are needed — without starting separate jobs or re-entering machine details each time.
        PUWER documentation is included on every inspection. Each form type still produces its own PDF on the web
        dashboard, so a service record never substitutes for a LOLER certificate, but the paperwork burden on site is
        much lower.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Check current{' '}
        <a
          href="https://www.hse.gov.uk/work-equipment/loler/"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          HSE LOLER guidance
        </a>{' '}
        and your examination scheme for each asset type.
      </p>

      <KeyTakeaways>
        <li>Service maintenance, pre-use checks, and LOLER thorough examinations serve different purposes.</li>
        <li>Only a competent person&apos;s thorough examination produces the statutory LOLER report.</li>
        <li>Expired LOLER certificates are a compliance gap even if the machine was recently serviced.</li>
        <li>One site visit can cover multiple forms — each must still produce the correct PDF evidence.</li>
      </KeyTakeaways>
      <PlantArticleCta />
    </ComplianceArticleContent>
  );
}

function PlantExaminationDueDateTrackingArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        LOLER compliance is not only about passing today&apos;s examination. It is about knowing when the next one is
        due — and making sure no machine slips through the gap between certificates. On busy sites, due dates live in
        diaries, whiteboards, and the memory of whoever last spoke to the examiner. That works until a hire extension,
        a new project, or a staff change leaves a machine running with an expired report.
      </p>

      <h2>What happens when an examination lapses</h2>
      <p>
        Using lifting equipment without a valid thorough examination can expose your business to enforcement action
        under LOLER. HSE can inspect lifting equipment and ask to see reports of thorough examination. If the certificate
        is out of date, you may need to take equipment out of use until it is examined — with the same downtime and
        commercial disruption that missed MOTs cause on vans.
      </p>
      <p>
        Client contracts and principal contractor rules increasingly require proof of current LOLER before plant is
        accepted on site. An expired certificate can block mobilisation even where the equipment appears mechanically
        sound.
      </p>

      <h2>Building a due date register</h2>
      <p>
        At minimum, every lifting asset needs a machine identifier, the date of the last thorough examination, the next
        due date, and a link to the current PDF report. For hired plant, record the hire reference and confirm who holds
        the certificate — your business or the hire company.
      </p>
      <p>
        Spreadsheets can work for a handful of machines if one person updates them reliably. The failure mode is
        familiar: a certificate arrives by email, the due date is typed incorrectly, or the machine is duplicated under
        a new plant number when it moves site. By the time someone notices, the examination window has passed.
      </p>

      <h2>Why advance reminders matter</h2>
      <p>
        Examiners need lead time to attend site. Projects need time to swap or stand down plant. A reminder on the due
        date itself is often too late. Many operators use a seven-day warning — the same practical window Fleet Track PRO
        uses for MOT renewals on vans — so managers can book the examiner before the certificate expires.
      </p>
      <p>
        Reminders should reach people who can act. If only one supervisor receives alerts and they are on leave, the
        system still fails. Push notifications to managers, plus a visible due date on the machine register, reduce
        that single-point-of-failure risk.
      </p>

      <h2>Keeping PDF reports accessible</h2>
      <p>
        HSE guidance requires reports to be available to the person using the equipment and to enforcing authorities when
        requested. Storing PDFs only on one phone or in a shared drive with unclear folder names makes retrieval slow
        during an audit. Central storage against each machine — with secure download from the web dashboard — means any
        authorised manager can produce the certificate without calling the yard.
      </p>
      <p>
        LOLER-related records should be retained for at least two years for accessories, and until the next report for
        other equipment. Digital retention with timestamps supports that requirement more reliably than paper files in
        multiple site cabins.
      </p>

      <h2>How Fleet Track PRO tracks examination due dates</h2>
      <p>
        When you register a machine in the Plant &amp; Machinery module, you set examination due dates and whether the
        asset lifts persons (affecting the six-month LOLER interval). After forms are submitted from one inspection
        entry, each PDF — LOLER, service, hire check, or PUWER — is stored against that inspection on the web dashboard.
        Managers receive push notifications when an examination is due within seven days or overdue. Because multiple
        forms can be completed in a single visit, fitters are less likely to skip the LOLER paperwork when they are
        already on site for a service or hire check.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Refer to{' '}
        <a
          href="https://www.hse.gov.uk/work-equipment/loler/report-thorough-examination-lifting-equipment.htm"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          HSE guidance on reports of thorough examination
        </a>{' '}
        for your operation.
      </p>

      <KeyTakeaways>
        <li>Every lifting asset needs a current LOLER report and a known next due date.</li>
        <li>Expired certificates can stop plant working on site and attract HSE scrutiny.</li>
        <li>Seven-day advance reminders give time to book examiners before lapse.</li>
        <li>Central PDF storage beats scattered email and paper when audits happen.</li>
      </KeyTakeaways>
      <PlantArticleCta />
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
    case 'loler-thorough-examination-records':
      return <LolerThoroughExaminationRecordsArticle />;
    case 'plant-machinery-service-vs-loler-examination':
      return <PlantMachineryServiceVsLolerArticle />;
    case 'plant-examination-due-date-tracking':
      return <PlantExaminationDueDateTrackingArticle />;
    default:
      return null;
  }
}

export default async function ComplianceArticlePage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveArticle(slug);
  if (!resolved) notFound();

  const allArticles = await getAllPublishedComplianceArticles();
  const related = allArticles.filter((a) => a.slug !== slug);
  const articleMeta: ComplianceArticleMeta =
    resolved.kind === 'static'
      ? { ...resolved.article, source: 'static' }
      : resolved.article;

  return (
    <div className="marketing-shell">
      <ComplianceArticleJsonLd article={articleMeta} />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 sm:pt-28 pb-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14">
          <article>
            <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-4">
              <Link href="/compliance-centre" className="hover:underline">
                Compliance Centre
              </Link>
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{articleMeta.title}</h1>
            <p className="mb-10 text-sm text-slate-400">
              Published{' '}
              {format(new Date(articleMeta.datePublished), 'd MMMM yyyy')}
              {articleMeta.dateModified && articleMeta.dateModified !== articleMeta.datePublished
                ? ` · Updated ${format(new Date(articleMeta.dateModified), 'd MMMM yyyy')}`
                : ''}
            </p>
            {resolved.kind === 'static' ? (
              <ArticleBody article={resolved.article} />
            ) : (
              <CmsComplianceArticleBody
                markdown={polishComplianceMarkdown(resolved.article.bodyMarkdown, true)}
              />
            )}
            <ArticleBottomCta />
          </article>
          <aside className="lg:sticky lg:top-28 h-fit space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white/[0.04] p-6">
              <p className="text-slate-900 font-semibold mb-3">Try the platform</p>
              <p className="text-slate-600 text-sm mb-4">
                See how inspections, defects, and reminders come together for UK fleets.
              </p>
              <Link
                href="/onboarding"
                className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-slate-50"
              >
                Try Fleet Track PRO Free for 7 Days →
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-16 pt-12 border-t border-slate-200 max-w-3xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Related articles</h2>
          <ul className="space-y-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/compliance-centre/${r.slug}`} className="text-[var(--brand-blue)] hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
