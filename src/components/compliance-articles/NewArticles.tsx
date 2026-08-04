import ComplianceArticleContent from '@/components/ComplianceArticleContent';
import { ArticleCta, KeyTakeaways } from '@/components/compliance-articles/ArticleChrome';

export function NilDefectReportsArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        Many fleets record defects carefully when something is wrong — then skip the paperwork when everything looks
        fine. That habit creates a quiet compliance gap. A nil-defect report is simply a record that the walkaround
        check happened and no safety defects were found. Without it, you may struggle to prove checks were completed
        on the days when nothing went wrong.
      </p>

      <h2>Why nil-defect records matter</h2>
      <p>
        DVSA and GOV.UK guidance on commercial vehicle walkaround checks expect operators to run a daily defect
        reporting system. Recording defects is essential, but so is showing that checks take place consistently. A
        file that only contains “problem days” can look incomplete when an examiner asks what happened on the days
        before a roadside stop.
      </p>
      <p>
        Nil-defect reports answer a basic question: was this vehicle checked before use today? If your process only
        creates paperwork when a fault is found, you cannot easily show that the quiet days were inspected at all.
      </p>

      <h2>What a nil-defect report should capture</h2>
      <p>Keep it simple, but make it useful later:</p>
      <ul>
        <li>Vehicle registration (or unique fleet ID)</li>
        <li>Date and time of the check</li>
        <li>Name of the person who completed it</li>
        <li>Confirmation that the required items were checked</li>
        <li>An explicit “no defects found” (nil) result</li>
      </ul>
      <p>
        Digital systems make this easier because the submission is timestamped and tied to a named user. Paper can
        work for a tiny fleet, but only if forms are completed daily, collected promptly and stored for the retention
        period.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>Assuming “no form means no problem” — missing records are still a gap.</li>
        <li>Batch-signing sheets at the end of the week for days already driven.</li>
        <li>Recording only serious defects and ignoring the walkaround itself.</li>
        <li>Using different processes for cars, vans and light commercials in the same fleet.</li>
      </ul>

      <h2>How this fits with Fleet Track PRO</h2>
      <p>
        In Fleet Track PRO, a completed inspection is itself evidence that the check was done. When no defect is
        raised, you still retain a structured, timestamped record managers can review later — useful for audits,
        client questions and roadside follow-up.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Always check current{' '}
        <a
          href="https://www.gov.uk/government/publications/guide-to-maintaining-roadworthiness"
          rel="noopener noreferrer"
          target="_blank"
        >
          DVSA Guide to Maintaining Roadworthiness
        </a>{' '}
        and GOV.UK walkaround guidance for your operation.
      </p>

      <KeyTakeaways>
        <li>Nil-defect reports prove the check happened, not only that faults were found.</li>
        <li>Record vehicle, date/time, checker and an explicit “no defects” result.</li>
        <li>Missing quiet-day records weaken your evidence at roadside or audit.</li>
        <li>Digital timestamped submissions reduce lost or backdated paperwork.</li>
      </KeyTakeaways>
      <ArticleCta />
    </ComplianceArticleContent>
  );
}

export function HowLongToKeepFleetRecordsArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        Keeping vehicles safe is only half of compliance. The other half is being able to prove what you did —
        sometimes months later. DVSA’s Guide to Maintaining Roadworthiness expects defect reports and related repair
        records to remain available for at least <strong>15 months</strong>. That window is longer than many small
        fleets assume.
      </p>

      <h2>What the 15-month expectation covers</h2>
      <p>In practice, operators should be able to produce:</p>
      <ul>
        <li>Daily walkaround / pre-use check records (including nil-defect results)</li>
        <li>Defect reports raised by drivers or responsible persons</li>
        <li>Evidence of assessment and repair (or decision to keep a vehicle off the road)</li>
        <li>Return-to-service sign-off where a defect was serious enough to stop use</li>
      </ul>
      <p>
        Electronic records are acceptable. What matters is that they are secure enough to rely on, available when
        asked for, and clear enough for someone outside your business to understand.
      </p>

      <h2>Why 15 months is the practical target</h2>
      <p>
        Fifteen months gives a full year of operation plus a buffer. Roadside findings, insurance claims, client
        audits and internal investigations often look backwards. If your retention policy is “until the folder is
        full”, you will lose the exact records you need most.
      </p>

      <h2>Paper vs digital retention</h2>
      <p>
        Paper can meet the rule if it is complete and stored safely — but wet cabs, lost pads and incomplete close-out
        notes are common failure points. Digital systems help by centralising records, avoiding missing pages and
        making search by vehicle or date realistic for a busy manager.
      </p>
      <p>
        Whatever system you use, test it: pick a vehicle and a date from 10 months ago. Can you find the check, any
        defect and the repair trail in a few minutes? If not, retention exists only on paper policy, not in practice.
      </p>

      <h2>How Fleet Track PRO helps</h2>
      <p>
        Fleet Track PRO keeps inspection and defect history in one place so managers can review and export evidence
        without hunting through folders. Retention still depends on your account and operational process — the
        platform is a tool to make the 15-month trail easier to maintain.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Confirm retention expectations in the
        current{' '}
        <a
          href="https://www.gov.uk/government/publications/guide-to-maintaining-roadworthiness"
          rel="noopener noreferrer"
          target="_blank"
        >
          Guide to Maintaining Roadworthiness
        </a>{' '}
        for your vehicle types and operations.
      </p>

      <KeyTakeaways>
        <li>Aim to keep walkaround, defect and repair records for at least 15 months.</li>
        <li>Nil-defect days belong in the same retention system as defect days.</li>
        <li>Electronic records are fine if they are available and understandable on request.</li>
        <li>Test retrieval: can you find last year’s check for a specific vehicle quickly?</li>
      </KeyTakeaways>
      <ArticleCta />
    </ComplianceArticleContent>
  );
}

export function ClosingDefectsReturnToServiceArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        Reporting a defect is not the end of the job. DVSA expects a system where faults are recorded{' '}
        <strong>and</strong> rectified before an unroadworthy vehicle is used again. The weak point in many fleets is
        the middle of the loop: the defect is logged, then the vehicle quietly goes back out before anyone closes the
        job.
      </p>

      <h2>The full defect loop</h2>
      <p>A complete trail usually looks like this:</p>
      <ul>
        <li>
          <strong>Report</strong> — driver or responsible person records the fault (with photos where useful).
        </li>
        <li>
          <strong>Assess</strong> — a competent person decides whether the vehicle can stay in use, needs delayed
          repair, or must be taken off the road (VOR).
        </li>
        <li>
          <strong>Repair / rectify</strong> — work is carried out or the vehicle remains out of service.
        </li>
        <li>
          <strong>Sign-off &amp; return to service</strong> — someone confirms the defect is closed before the vehicle
          is released.
        </li>
      </ul>

      <h2>Why open defects are a compliance risk</h2>
      <p>
        If DVSA finds a serious fault at the roadside and your records show the same issue was already reported —
        with no repair or VOR decision — the problem is no longer “a driver missed it”. It becomes a maintenance
        system failure. That is a much harder position for the operator.
      </p>

      <h2>Practical rules for managers</h2>
      <ul>
        <li>Do not treat “reported” as “resolved”.</li>
        <li>Keep dangerous defects out of service until signed off.</li>
        <li>Link the repair note to the original defect (same vehicle, same issue).</li>
        <li>Review open defects daily — not only when something becomes urgent.</li>
      </ul>

      <h2>How Fleet Track PRO supports the loop</h2>
      <p>
        Fleet Track PRO is built around report → notify → repair → resolve. Defects stay visible on My Jobs until
        closed, so managers and fitters can see unfinished work instead of relying on memory or WhatsApp threads.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. Follow current DVSA and GOV.UK guidance
        for defect reporting and roadworthiness decisions in your fleet.
      </p>

      <KeyTakeaways>
        <li>Every defect needs a clear path from report to close-out.</li>
        <li>Unroadworthy vehicles should not return to service until signed off.</li>
        <li>Open reported defects with no action are a major roadside risk.</li>
        <li>Use a workflow that keeps unfinished defects visible until resolved.</li>
      </KeyTakeaways>
      <ArticleCta />
    </ComplianceArticleContent>
  );
}

export function PreparingForDvsaRoadsideCheckArticle() {
  return (
    <ComplianceArticleContent>
      <p>
        A DVSA roadside check can happen with little notice. The examiner’s focus is the vehicle in front of them —
        but your records decide whether the stop looks like an isolated fault or a wider maintenance problem. Preparing
        in advance is simpler than scrambling after a prohibition.
      </p>

      <h2>What typically happens</h2>
      <p>
        Officers may inspect the vehicle’s condition and ask about your walkaround process. GOV.UK guidance explains
        that DVSA can request a record of the walkaround check at the roadside. If a serious defect is found, outcomes
        can include prohibitions, fixed penalties or further follow-up with the operator.
      </p>

      <h2>Evidence that helps most</h2>
      <ul>
        <li>Today’s (or the most recent) walkaround / pre-use check for that vehicle</li>
        <li>Any open or recently closed defects linked to the same vehicle</li>
        <li>Repair or sign-off notes where a defect was reported</li>
        <li>Clear vehicle identity (registration) and who completed the check</li>
      </ul>
      <p>
        Photo evidence helps when a defect was already reported and parked up — it shows you acted before the stop,
        not after.
      </p>

      <h2>How to prepare your fleet week by week</h2>
      <ul>
        <li>Make daily checks a non-negotiable start-of-use habit for every vehicle type you run.</li>
        <li>Review open defects every morning — do not wait for the workshop to chase you.</li>
        <li>Train drivers on what to check and how to report clearly.</li>
        <li>Keep records searchable so a manager can pull history quickly if asked.</li>
      </ul>

      <h2>Using software without overclaiming</h2>
      <p>
        Apps do not replace a physical check. They support a maintenance system by making records harder to lose and
        easier to produce. Fleet Track PRO helps UK fleets keep inspections, defects and close-out status in one place
        so you are not reconstructing history from paper pads and message threads under pressure.
      </p>

      <p className="compliance-disclaimer">
        This article summarises general principles and is not legal advice. See{' '}
        <a
          href="https://www.gov.uk/roadside-vehicle-checks-for-commercial-drivers"
          rel="noopener noreferrer"
          target="_blank"
        >
          GOV.UK roadside vehicle checks guidance
        </a>{' '}
        for current enforcement information.
      </p>

      <KeyTakeaways>
        <li>Prepare records before you need them — not after a stop.</li>
        <li>Have the latest walkaround and defect history ready for each vehicle.</li>
        <li>Open defects and missing checks are red flags alongside the vehicle fault.</li>
        <li>Software helps when it supports honest daily checks, not when it replaces them.</li>
      </KeyTakeaways>
      <ArticleCta />
    </ComplianceArticleContent>
  );
}
