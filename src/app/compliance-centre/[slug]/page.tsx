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
  complianceArticleBySlug,
  type ComplianceArticle,
} from '@/content/complianceArticles';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COMPLIANCE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = complianceArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: `/compliance-centre/${slug}` },
    openGraph: {
      title: `${article.title} | Stock Track PRO`,
      description: article.metaDescription,
      url: `https://www.stocktrackpro.co.uk/compliance-centre/${slug}`,
      siteName: 'Stock Track PRO',
      locale: 'en_GB',
      type: 'article',
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified ?? article.datePublished,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | Stock Track PRO`,
      description: article.metaDescription,
    },
  };
}

function KeyTakeaways({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-12 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 sm:p-8">
      <h2 className="mb-5 text-xl font-semibold text-white">Key takeaways</h2>
      <ul className="compliance-takeaway-list space-y-3">{children}</ul>
    </div>
  );
}

function ArticleCta() {
  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
      <p className="text-base leading-relaxed text-white/85">
        <span className="font-medium text-white">Stock Track PRO</span> helps automate this process for UK fleets.{' '}
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
          className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
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
          className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
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
          className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
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
        Stock Track PRO is built for this workflow: drivers complete structured inspections in the mobile app, defects
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
          className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
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
        Stock Track PRO requires a 6-photo walkaround covering the front, rear, driver side, passenger side, interior and odometer. Each submission is timestamped and tied to a named user. If a defect is reported, managers and fitters can see the issue quickly instead of waiting for paper to reach the office.
      </p>

      <h2>The enforcement risk of incomplete records</h2>
      <p>
        GOV.UK guidance on{' '}
        <a
          href="https://www.gov.uk/roadside-vehicle-checks-for-commercial-drivers"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
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
        Time savings vary by fleet size and process, but many operators can save around 10 to 20 minutes per driver per week on inspection administration alone. The saving comes from fewer paper handovers, less scanning, fewer phone calls, faster defect routing and easier retrieval when someone asks for evidence.
      </p>
      <p>
        The bigger saving is often management time. Searching for a specific inspection from three months ago can take minutes in a digital system and much longer in a paper archive. If you run 20, 50 or 100 vehicles, that difference compounds quickly.
      </p>

      <h2>Paper is familiar, but digital is more resilient</h2>
      <p>
        Paper inspection sheets are familiar and low cost at the point of use, but they depend heavily on human discipline. Digital systems do not remove responsibility; they make the responsible process easier to follow. Drivers get a consistent flow, fitters get clearer jobs, and managers get records that can be searched and reviewed without chasing paperwork.
      </p>

      <KeyTakeaways>
        <li>Paper inspection sheets are vulnerable to lost forms, illegible notes and delayed reporting.</li>
        <li>Digital inspections create timestamped records with named users and photo evidence.</li>
        <li>A strong audit trail helps during insurance claims, court cases and compliance checks.</li>
        <li>Stock Track PRO uses a 6-photo walkaround, timestamped submission and named user attribution.</li>
        <li>Digital workflows can save drivers and managers meaningful admin time each week.</li>
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

      <h2>How Stock Track PRO handles MOT and tax tracking</h2>
      <p>
        Stock Track PRO displays MOT and tax status on every vehicle card so managers can review compliance while looking at the fleet. The platform uses DVLA data to support automatic MOT and tax status visibility by registration plate. It also sends automatic alerts before expiry, including 7-day advance warnings, so managers have time to book renewals instead of reacting after the deadline.
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

      <KeyTakeaways>
        <li>Driving without a valid MOT can lead to a fine of up to £1,000 and may affect insurance.</li>
        <li>Spreadsheets become risky when vehicles, dates and responsibilities change across a fleet.</li>
        <li>DVLA data integration helps keep MOT and tax status visible by registration plate.</li>
        <li>7-day advance warnings give managers time to book renewals before vehicles become non-compliant.</li>
        <li>Stock Track PRO shows MOT and tax status on every vehicle card and sends automatic alerts before expiry.</li>
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
        that a responsible person looked at the vehicle at the point of use.
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
        &quot;all OK&quot; with no name and no timestamp, it is weak evidence when something goes wrong later.
      </p>

      <h2>Paper vs digital pre-use checks</h2>
      <p>
        Paper booklets can work for very small fleets if they are completed, collected, and stored properly. The
        weakness is delay: a defect noted on paper may not reach a manager until hours or days later. Digital pre-use
        checks can timestamp submissions, attach photos, notify managers immediately, and store records centrally for
        retrieval during an audit or insurance enquiry.
      </p>
      <p>
        Stock Track PRO uses a structured mobile inspection flow with required photos and checklist items, so drivers
        cannot skip steps and managers see new defects without waiting for paperwork.
      </p>

      <h2>How often should checks happen?</h2>
      <p>
        Many operators require a check at the start of each working day or before each shift when the vehicle is used.
        If a vehicle is shared between drivers, each user should understand whether a fresh check is required when they
        take over. Consistency matters more than the exact label on the form.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Follow current DVSA and employer guidance for your operation.
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

      <h2>What makes a defect record credible?</h2>
      <p>
        A credible record answers basic questions without guesswork: which vehicle, who reported the issue, when it was
        reported, what the defect was, who reviewed it, what action was taken, and when the vehicle returned to
        service. Vague notes such as &quot;brake noise&quot; without context are easier to challenge than a clear
        description with supporting photos and a repair trail.
      </p>

      <h2>How digital records differ from paper</h2>
      <p>
        Paper can meet the requirement in theory, but it often fails in practice through lost sheets, late submission,
        illegible handwriting, and missing signatures. Digital systems generate timestamps automatically, tie records to
        named users, attach photos at the point of reporting, and route defects to managers or fitters without relying
        on someone physically handing over a form.
      </p>
      <p>
        That does not make digital records automatically acceptable. Inspectors can still ask whether drivers were
        trained, whether managers acted on alerts, and whether the system was used consistently across the fleet.
      </p>

      <h2>Roadside checks and follow-up investigations</h2>
      <p>
        At the roadside, an examiner may find a defect that should have been visible during a recent check. If your
        records show no defect and no inspection around that period, you may be asked how your maintenance system works.
        If your records show a defect was reported, the vehicle was marked out of use, and repair was signed off before
        return to service, that is a much stronger position.
      </p>

      <h2>What operators should avoid</h2>
      <p>
        Backdating checks, completing forms in bulk at the end of the week, or closing defects without evidence of repair
        undermines both paper and digital systems. Inspectors are interested in patterns. If every vehicle shows
        &quot;no defects&quot; every day while serious faults appear at roadside stops, the record-keeping system will
        be questioned.
      </p>

      <h2>Using software as part of compliance culture</h2>
      <p>
        Stock Track PRO supports defect reporting with timestamped submissions, photo evidence, workflow status from
        open to resolved, and manager visibility on the web dashboard. The software does not replace operator
        responsibility, but it makes good practice easier to follow and easier to demonstrate when evidence is
        requested.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Always check current{' '}
        <a
          href="https://www.gov.uk/roadside-vehicle-checks-for-commercial-drivers"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK roadside check guidance
        </a>{' '}
        for your operation.
      </p>

      <KeyTakeaways>
        <li>DVSA looks for a working maintenance process, not isolated forms.</li>
        <li>Digital records need timestamps, named users, and clear defect close-out.</li>
        <li>Weak or inconsistent records are a liability at roadside checks and audits.</li>
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
    default:
      return null;
  }
}

export default async function ComplianceArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = complianceArticleBySlug(slug);
  if (!article) notFound();

  const related = COMPLIANCE_ARTICLES.filter((a) => a.slug !== slug);

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <ComplianceArticleJsonLd article={article} />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 sm:pt-28 pb-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14">
          <article>
            <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-4">
              <Link href="/compliance-centre" className="hover:underline">
                Compliance Centre
              </Link>
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{article.title}</h1>
            <p className="mb-10 text-sm text-white/45">
              Published{' '}
              {format(new Date(article.datePublished), 'd MMMM yyyy')}
              {article.dateModified && article.dateModified !== article.datePublished
                ? ` · Updated ${format(new Date(article.dateModified), 'd MMMM yyyy')}`
                : ''}
            </p>
            <ArticleBody article={article} />
            <ArticleBottomCta />
          </article>
          <aside className="lg:sticky lg:top-28 h-fit space-y-6">
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6">
              <p className="text-white font-semibold mb-3">Try the platform</p>
              <p className="text-white/65 text-sm mb-4">
                See how inspections, defects, and reminders come together for UK fleets.
              </p>
              <Link
                href="/onboarding"
                className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black"
              >
                Try Stock Track PRO Free for 7 Days →
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-16 pt-12 border-t border-white/10 max-w-3xl">
          <h2 className="text-lg font-semibold text-white mb-4">Related articles</h2>
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
