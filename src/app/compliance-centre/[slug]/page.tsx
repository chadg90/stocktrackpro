import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { ComplianceArticleJsonLd } from '@/components/seo/ComplianceArticleJsonLd';
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
  };
}

function KeyTakeaways({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Key Takeaways</h2>
      <ul className="space-y-2 text-white/80 text-base">{children}</ul>
    </div>
  );
}

function ArticleCta() {
  return (
    <p className="not-prose rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/85">
      Stock Track PRO automates this process for UK fleets.{' '}
      <Link href="https://www.stocktrackpro.co.uk/onboarding/" className="text-blue-300 hover:text-blue-200 underline underline-offset-4">
        Try free for 7 days — no card required.
      </Link>
    </p>
  );
}

function OLicenceDefectRecordsArticle() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-white/80">
      <p>
        A valid defect record is evidence that a vehicle fault was reported, assessed and dealt with through a controlled maintenance process. For an operator licence holder, that record matters because the Driver and Vehicle Standards Agency (DVSA) expects operators to show that vehicles are checked before use, defects are recorded clearly, and safety-related faults are repaired before a vehicle is allowed back into service.
      </p>

      <h2>What is an O-licence?</h2>
      <p>
        An operator licence, often called an O-licence, is the authorisation needed by many businesses that operate goods vehicles or passenger vehicles commercially in Great Britain. Goods vehicle operator licensing commonly applies when vehicles or vehicle-and-trailer combinations exceed the relevant weight threshold, and PSV licensing applies to many passenger transport operations. The exact licence type depends on the vehicle, use case and operating model, so operators should check current government and Traffic Commissioner guidance for their own fleet.
      </p>
      <p>
        Holding an O-licence is not just an administrative formality. It comes with undertakings around roadworthiness, maintenance systems, driver checks and record keeping. If your fleet is inspected, stopped at the roadside or audited after an incident, you need to demonstrate that you had a working system in place before the issue occurred.
      </p>

      <h2>What must a defect record include?</h2>
      <p>
        DVSA guidance expects operators to keep defect reports that clearly identify the driver, the date of the check, the vehicle registration, the defect description and the action taken. Where a defect is found, the record should show who reviewed it and who signed it off as resolved or safe for continued operation. The responsible person may be a transport manager, fleet manager, mechanic, fitter or another competent person authorised by the operator.
      </p>
      <p>
        A useful defect record should answer five questions without needing a phone call: which vehicle was involved, who reported the issue, when it was reported, what the issue was, and what happened next. If the answer is hidden in a WhatsApp message, scribbled on a paper sheet or known only by one driver, it is weak evidence.
      </p>

      <h2>Minor defects and notifiable defects</h2>
      <p>
        Not every defect has the same risk. A minor defect may be something that should be monitored or scheduled but does not make the vehicle unsafe for immediate use. A notifiable or safety-critical defect is different: brakes, steering, tyres, lights, load security, mirrors, windscreen visibility and similar items can create immediate road safety risks. When a safety-critical defect is found, the vehicle should not be used until a competent person has assessed and resolved the issue.
      </p>
      <p>
        The record should make that decision visible. If a driver notes a tyre problem, for example, the defect record should not stop at &quot;tyre issue&quot;. It should explain the condition, identify the vehicle, record supporting evidence where available, and show whether the vehicle was taken out of use, repaired, monitored or signed off.
      </p>

      <h2>What happens during a DVSA roadside check or operator audit?</h2>
      <p>
        During a roadside check, DVSA examiners may inspect the vehicle and review whether obvious defects should have been picked up before the journey. If a serious defect is found, the vehicle can receive a prohibition notice, which may prevent it from being driven until the issue is fixed. The examiner may also consider whether the operator&apos;s maintenance system is effective.
      </p>
      <p>
        During an operator audit or compliance investigation, the focus is broader. Inspectors may ask for inspection sheets, defect reports, repair records and evidence that faults were closed out. They are looking for a pattern: do drivers check vehicles consistently, do managers see defects quickly, are repairs recorded, and can the operator prove that unsafe vehicles were not knowingly kept on the road?
      </p>

      <h2>Why paper defect records fail</h2>
      <p>
        Paper records can meet the basic requirement if they are completed properly, stored securely and retrieved quickly. In practice, they often fail because forms are lost, handwriting is illegible, photos are missing, timestamps are unclear and accountability is weak. A driver may hand a sheet to the wrong person. A fitter may fix a defect but forget to sign the form. A manager may only discover the issue days later when the paperwork is collected.
      </p>
      <p>
        Paper also makes trend analysis difficult. If the same vehicle repeatedly has tyre, brake or lighting problems, a digital dashboard can surface that pattern. A filing cabinet usually cannot. That matters because DVSA and Traffic Commissioners are interested in systems, not just single events.
      </p>

      <h2>How digital records satisfy the same requirements</h2>
      <p>
        A digital defect record can contain the same legally relevant information as paper: driver name, date, vehicle registration, defect details, review status, repair notes and sign-off. The advantage is that the record is created in a structured format and stored centrally. Timestamps are generated automatically, photos can be attached at the point of inspection, and managers can see new defects without waiting for paper to move around the business.
      </p>
      <p>
        Stock Track PRO is a concrete example. Drivers complete inspections in the mobile app, defects are submitted with timestamped records and photo evidence, and fitters can manage the issue through a close-out workflow. Managers can then review the full history for each vehicle, including who reported the defect, what action was taken and when the issue was resolved.
      </p>

      <h2>Keep records factual and consistent</h2>
      <p>
        A good defect record should avoid vague language. &quot;Problem with van&quot; is not enough. &quot;Nearside rear tyre below safe tread depth, vehicle removed from use, replacement fitted by fitter and signed off before return to service&quot; is much stronger. The same principle applies whether you use paper or software: the record should allow someone outside the business to understand the decision made at the time.
      </p>

      <p className="text-white/55 text-sm italic">
        This article summarises general principles and is not legal advice. Always check current DVSA, Traffic Commissioner and government guidance for your own operation.
      </p>

      <KeyTakeaways>
        <li>A valid defect record should identify the driver, date, vehicle registration, defect description and sign-off.</li>
        <li>Safety-critical defects should be assessed before a vehicle is returned to service.</li>
        <li>DVSA checks look for evidence of a working maintenance system, not just isolated forms.</li>
        <li>Paper can work, but lost forms, unclear handwriting and missing timestamps weaken evidence.</li>
        <li>Digital records provide faster reporting, photo evidence and clearer accountability.</li>
      </KeyTakeaways>
      <ArticleCta />
    </div>
  );
}

function PaperVsDigitalArticle() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-white/80">
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
        Digital vehicle inspection software can capture structured data that paper cannot manage well: GPS timestamps where enabled, named user attribution, photo evidence, consistent checklist responses and live notification to managers or fitters. Location capture must be used carefully and transparently, but timestamped digital evidence is already a major improvement over handwritten sheets.
      </p>
      <p>
        Stock Track PRO requires a 6-photo walkaround covering the front, rear, driver side, passenger side, interior and odometer. Each submission is timestamped and tied to a named user. If a defect is reported, managers and fitters can see the issue quickly instead of waiting for paper to reach the office.
      </p>

      <h2>The legal risk of incomplete paper records</h2>
      <p>
        In an insurance claim, employment dispute, customer complaint or court case, the quality of your inspection evidence matters. If you cannot show that a vehicle was checked, that a defect was raised, or that action was taken, it becomes harder to prove that your business operated responsibly. A paper form that is missing, unsigned or completed late may be challenged.
      </p>
      <p>
        A digital record is not automatically &quot;better&quot; just because it is digital. It must still be accurate, retained properly and used consistently. The advantage is that a well-designed digital system creates a court-admissible audit trail more reliably because events are recorded in sequence, linked to users and stored centrally.
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
    </div>
  );
}

function MotExpiryTrackingArticle() {
  return (
    <div className="prose prose-invert prose-lg max-w-none text-white/80">
      <p>
        MOT expiry tracking is one of the simplest fleet compliance tasks to understand and one of the easiest to get wrong at scale. A single missed MOT can take a vehicle off the road, create customer disruption and expose the operator to enforcement action. When a business runs multiple vans, HGVs, plant vehicles or mixed fleet assets, relying on memory or a spreadsheet becomes a risk.
      </p>

      <h2>Why expired MOTs are high risk</h2>
      <p>
        In the UK, driving a vehicle without a valid MOT can lead to a fine of up to £1,000. If the vehicle is also in a dangerous condition, the consequences can be more serious. An expired MOT may also affect insurance, especially if a vehicle involved in an incident was not legally roadworthy or should not have been used.
      </p>
      <p>
        For commercial operators, the risk goes beyond the single vehicle. A roadside stop, customer complaint or collision can trigger wider scrutiny of maintenance systems. If an operator cannot show that renewals are monitored and vehicles are kept roadworthy, DVSA or the Traffic Commissioner may ask harder questions about the business&apos;s compliance culture.
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
        For O-licence holders and other commercial fleets, this routine is part of the wider maintenance system. MOT tracking, daily inspections and defect close-out should support each other. If a vehicle fails an MOT because of a defect that should have been picked up earlier, the issue is not just the missed test; it is the process that allowed the fault to continue.
      </p>

      <KeyTakeaways>
        <li>Driving without a valid MOT can lead to a fine of up to £1,000 and may affect insurance.</li>
        <li>Spreadsheets become risky when vehicles, dates and responsibilities change across a fleet.</li>
        <li>DVLA data integration helps keep MOT and tax status visible by registration plate.</li>
        <li>7-day advance warnings give managers time to book renewals before vehicles become non-compliant.</li>
        <li>Stock Track PRO shows MOT and tax status on every vehicle card and sends automatic alerts before expiry.</li>
      </KeyTakeaways>
      <ArticleCta />
    </div>
  );
}

function ArticleBody({ article }: { article: ComplianceArticle }) {
  switch (article.slug) {
    case 'o-licence-defect-records':
      return <OLicenceDefectRecordsArticle />;
    case 'paper-vs-digital-inspection-sheets':
      return <PaperVsDigitalArticle />;
    case 'mot-expiry-tracking-for-fleets':
      return <MotExpiryTrackingArticle />;
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
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">{article.title}</h1>
            <ArticleBody article={article} />
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
