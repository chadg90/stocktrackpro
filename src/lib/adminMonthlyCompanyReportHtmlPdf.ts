import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MonthlyCompanyReportInput } from '@/lib/adminMonthlyCompanyReportPdf';
import {
  REPORT_APP_VERSION,
  buildExecutiveSummary,
  buildPriorityActions,
  buildReferenceId,
  complianceTrendLabel,
  formatGeneratedAt,
  formatPercentChange,
  prepareOpenDefectRowsForReport,
  titleCaseName,
} from '@/lib/adminMonthlyCompanyReportHelpers';

function esc(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function arrow(delta: number, goodWhenUp: boolean): { symbol: string; cls: string; text: string } {
  const up = delta >= 0;
  const good = goodWhenUp ? up : !up;
  return {
    symbol: up ? '&#8593;' : '&#8595;',
    cls: good ? 'good' : 'bad',
    text: `${up ? '+' : '&minus;'}${Math.abs(Math.round(delta))}`,
  };
}

function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\r\n|\r|\n/g, '<br>')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u0100-\u017F<>\/\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function buildHtml(input: MonthlyCompanyReportInput): string {
  const logoPath = join(process.cwd(), 'public', 'report-logo-uploaded.png');
  const logoBase64 = readFileSync(logoPath).toString('base64');
  const logoSrc = `data:image/png;base64,${logoBase64}`;
  const companyName = esc(input.companyName);
  const month = esc(input.monthLabel);
  const ref = buildReferenceId(input.generatedAt);
  const generatedLabel = esc(formatGeneratedAt(input.generatedAt));
  const generatedBy = esc(input.generatedBy || 'Stock Track PRO Admin');
  const critical = Math.round(input.criticalOpenDefects);
  const checks = Math.round(input.checksCompleted);
  const reported = Math.round(input.defectsReported);
  const resolved = Math.round(input.defectsResolved);
  const openDefects = Math.round(input.openDefects || 0);
  const cChecks = arrow(input.comparison?.checksDelta ?? 0, true);
  const cReported = arrow(input.comparison?.defectsReportedDelta ?? 0, false);
  const cResolved = arrow(input.comparison?.defectsResolvedDelta ?? 0, true);
  const checksColor = cChecks.cls === 'good' ? '#1a7a3a' : '#d94040';
  const reportedColor = cReported.cls === 'good' ? '#1a7a3a' : '#d94040';
  const resolvedColor = cResolved.cls === 'good' ? '#1a7a3a' : '#d94040';
  const prev = esc(input.comparison?.previousMonthLabel || 'Previous month');
  const prevChecks = Math.round(input.comparison?.previousChecks ?? checks - (input.comparison?.checksDelta ?? 0));
  const prevReported = Math.round(
    input.comparison?.previousDefectsReported ?? reported - (input.comparison?.defectsReportedDelta ?? 0)
  );
  const prevResolved = Math.round(
    input.comparison?.previousDefectsResolved ?? resolved - (input.comparison?.defectsResolvedDelta ?? 0)
  );
  const trend = (input.trend || []).slice(-4);
  const usersReported = Math.max(0, Math.round(input.usersReportedCount || 0));
  const usersNot = Math.max(0, Math.round(input.usersNotReportedCount || 0));
  const usersTotal = usersReported + usersNot;
  const compliance = input.complianceRate ?? (usersTotal > 0 ? Math.round((usersReported / usersTotal) * 100) : 0);
  const previousCompliance = input.previousComplianceRate ?? null;
  const complianceDelta =
    previousCompliance === null ? null : compliance - previousCompliance;
  const totalVehicles = Math.round(input.totalVehicles || 0);
  const vehiclesInspected = Math.round(input.vehiclesInspected || 0);
  const inspectionRate =
    input.inspectionRate ?? (totalVehicles > 0 ? Math.round((vehiclesInspected / totalVehicles) * 100) : null);
  const avgDefects =
    input.avgDefectsPerVehicle === null || input.avgDefectsPerVehicle === undefined
      ? 'N/A'
      : input.avgDefectsPerVehicle.toFixed(2);
  const avgRepair =
    input.avgRepairDays === null || input.avgRepairDays === undefined
      ? 'N/A'
      : `${input.avgRepairDays.toFixed(1)} days`;
  const health = input.fleetHealthScore ?? 0;
  const healthColor = health >= 80 ? '#1a7a3a' : health >= 60 ? '#c47a00' : '#d94040';
  const healthTrend = esc(complianceTrendLabel(complianceDelta));
  const executiveSummary = esc(buildExecutiveSummary(input));
  const { rows: openDefectRows, overflowCount } = prepareOpenDefectRowsForReport(input.openDefectsList || []);
  const openRows = openDefectRows
    .map((row) => {
      const priClass = row.priority === 'critical' ? 'pri-critical' : 'pri-standard';
      const days = row.daysOpen === undefined || row.daysOpen === null ? '—' : `${row.daysOpen} day${row.daysOpen === 1 ? '' : 's'}`;
      return `<tr>
        <td class="reg">${esc(row.vehicle)}</td>
        <td class="desc-cell">${sanitizeText(row.description)}</td>
        <td>${esc(row.raised)}</td>
        <td>${days}</td>
        <td><span class="badge ${priClass}">${row.priority === 'critical' ? '&#128308; Critical' : '&#128993; Standard'}</span></td>
        <td><span class="badge status-open">&#128992; Open</span></td>
      </tr>`;
    })
    .join('');
  const openOverflowNote =
    overflowCount > 0
      ? `<p class="muted-note">+ ${overflowCount} more open defect(s) not shown</p>`
      : '';
  const actions = buildPriorityActions(input);
  const actionsHtml = actions
    .map((action) => {
      const tierClass =
        action.tier === 'immediate' ? 'tier-immediate' : action.tier === 'this_week' ? 'tier-week' : 'tier-continue';
      const icon = action.tier === 'immediate' ? '&#128308;' : action.tier === 'this_week' ? '&#128992;' : '&#128994;';
      return `<li class="${tierClass}"><span class="tier">${icon} ${esc(action.title)}</span><span class="detail">${esc(action.detail)}</span></li>`;
    })
    .join('');
  const usersWithChecks = input.usersWithChecks || [];
  const usersWithoutChecks = input.usersWithoutChecks || [];
  const topName = input.topInspectorName ? titleCaseName(input.topInspectorName) : usersWithChecks[0]?.name || null;
  const topChecks = input.topInspectorChecks ?? usersWithChecks[0]?.checksCompleted ?? 0;
  const staffRows =
    usersWithChecks
      .map((user) => {
        const name = esc(titleCaseName(user.name));
        const defects = user.defectsRaised ?? 0;
        const last = esc(user.lastInspection || '—');
        return `<tr><td>${name}</td><td class="num">${user.checksCompleted}</td><td class="num">${defects}</td><td>${last}</td></tr>`;
      })
      .join('') || '<tr><td colspan="4" class="empty-cell">No staff completed checks this month</td></tr>';
  const withoutRows =
    usersWithoutChecks
      .map((user) => `<tr><td>${esc(titleCaseName(user.name))}</td></tr>`)
      .join('') || '<tr><td class="empty-cell">All staff completed at least one check</td></tr>';

  const chartLabels = JSON.stringify(trend.map((t) => t.month.slice(0, 3)));
  const chartChecks = JSON.stringify(trend.map((t) => Math.round(t.checks)));
  const chartReported = JSON.stringify(trend.map((t) => Math.round(t.defectsReported)));
  const chartResolved = JSON.stringify(trend.map((t) => Math.round(t.defectsResolved)));

  const alertBorder = critical > 0 ? '#d94040' : '#e6a817';
  const alertBg = critical > 0 ? '#fce8e8' : '#fff8e6';
  const alertColor = critical > 0 ? '#7a1a1a' : '#7a4a00';

  return `<!doctype html>
<html><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *{box-sizing:border-box}
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;color:#111827;background:#fff}
    .page{max-width:720px;margin:0 auto;padding:0 0 8px;position:relative}
    .page + .page{page-break-before:always;padding-top:8px}
    .watermark{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:.05;z-index:0}
    .watermark img{width:420px;height:auto}
    .content{position:relative;z-index:1}
    .hdr{padding:18px 24px 14px;border-bottom:2px solid #2563eb;display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
    .meta-right{text-align:right}
    .meta-right .company{font-size:16px;font-weight:700;color:#111827}
    .meta-right .month{font-size:13px;color:#2563eb;font-weight:600;margin-top:2px}
    .meta-right .ref{font-size:11px;color:#9ca3af;margin-top:4px}
    .cover-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:14px;padding:18px 24px 0}
    .score-card{border:1px solid #e5e7eb;border-radius:14px;padding:18px;background:linear-gradient(180deg,#f8fbff 0%,#fff 100%)}
    .score-card .label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280}
    .score-card .score{font-size:56px;font-weight:700;line-height:1;margin:8px 0 4px;color:${healthColor}}
    .score-card .sub{font-size:13px;color:#4b5563}
    .cover-metrics{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .metric{border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#f9fafb}
    .metric .k{font-size:11px;color:#6b7280}
    .metric .v{font-size:22px;font-weight:600;margin-top:4px;color:#111827}
    .exec{margin:16px 24px 0;border-left:4px solid #2563eb;background:#eff6ff;border-radius:0 10px 10px 0;padding:12px 14px}
    .exec h2{margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1d4ed8}
    .exec p{margin:0;font-size:13px;line-height:1.55;color:#1f2937}
    .alert{margin:14px 24px 0;border-radius:10px;padding:10px 12px;display:flex;justify-content:space-between;gap:12px;border:1px solid ${alertBorder};background:${alertBg};color:${alertColor};font-size:13px}
    .section{padding:16px 24px 0}
    .label{font-size:11px;letter-spacing:.08em;color:#2563eb;text-transform:uppercase;margin:0 0 12px;font-weight:700}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .kpi{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 12px;text-align:left}
    .kpi .icon{font-size:12px;margin-bottom:4px}
    .kpi .v{font-size:28px;font-weight:700;line-height:1;color:#111827}
    .kpi .t{font-size:11px;color:#6b7280;margin-top:6px;text-transform:uppercase;letter-spacing:.04em}
    .kpi .d{font-size:11px;margin-top:6px}
    .kpi.critical{background:#fce8e8;border-color:#f3c0c0}
    .kpi.critical .v{color:#d94040}
    .secondary-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}
    .sk{border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;background:#fff}
    .sk .v{font-size:18px;font-weight:600}
    .sk .t{font-size:11px;color:#6b7280;margin-top:2px}
    .coverage{margin-top:10px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px}
    .bar{height:7px;background:#e5e7eb;border-radius:999px;overflow:hidden}
    .bar>span{display:block;height:7px;background:#2563eb;border-radius:999px}
    .legend{display:flex;gap:14px;font-size:12px;color:#6b7280;margin-bottom:8px}
    .legend i{width:10px;height:10px;border-radius:2px;display:inline-block;margin-right:6px}
    .chart-wrap{position:relative;width:100%;height:220px;border:1px solid #e5e7eb;border-radius:12px;padding:10px 8px 4px;background:#fbfdff}
    table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:12.5px}
    th,td{padding:7px 4px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top}
    th{color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
    tr:last-child td{border-bottom:0}
    .reg{font-weight:700;letter-spacing:.02em}
    .desc-cell{line-height:1.4}
    .badge{padding:2px 8px;border-radius:999px;font-size:11px;display:inline-block;white-space:nowrap}
    .pri-critical{background:#fce8e8;color:#a03030}
    .pri-standard{background:#fff3cd;color:#7a4a00}
    .status-open{background:#fff3cd;color:#7a4a00}
    .compare td.up{color:#1a7a3a;font-weight:600}
    .compare td.down{color:#d94040;font-weight:600}
    .actions{list-style:none;margin:0;padding:0}
    .actions li{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #e5e7eb}
    .actions li:last-child{border-bottom:0}
    .actions .tier{min-width:110px;font-size:12px;font-weight:700}
    .actions .detail{font-size:13px;line-height:1.45;color:#1f2937}
    .tier-immediate .tier{color:#d94040}
    .tier-week .tier{color:#c47a00}
    .tier-continue .tier{color:#1a7a3a}
    .highlights{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
    .hl{border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;background:#f9fafb}
    .hl .k{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em}
    .hl .v{font-size:18px;font-weight:700;margin-top:4px}
    .hl .s{font-size:12px;color:#6b7280;margin-top:2px}
    .user-grid{display:grid;grid-template-columns:1.4fr .9fr;gap:16px}
    .num{text-align:right;font-weight:600;color:#2563eb}
    .empty-cell{color:#9ca3af}
    .muted-note{font-size:11px;color:#9ca3af;margin:8px 0 0}
    .meta-box{margin:16px 24px 0;border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;background:#f9fafb}
    .meta-box h3{margin:0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#2563eb}
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;font-size:12px}
    .meta-grid span{color:#6b7280}
    .ftr{margin:16px 24px 10px;padding:14px 0 0;border-top:1px solid #e5e7eb;color:#6b7280;font-size:11px}
    .ftr .line{display:flex;justify-content:space-between;gap:12px;margin-top:4px}
    @media print {
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
      .section, .cover-grid, .actions, .user-grid { page-break-inside: avoid; }
    }
  </style>
</head><body>
<div class="watermark"><img src="${logoSrc}" alt="" /></div>
<div class="content">
  <div class="page">
    <header class="hdr">
      <div>
        <img src="${logoSrc}" style="width:200px;height:auto;max-height:52px;object-fit:contain" alt="Stock Track PRO logo" />
        <div style="margin-top:8px;font-size:12px;color:#6b7280">Monthly fleet performance report</div>
      </div>
      <div class="meta-right">
        <div class="company">${companyName}</div>
        <div class="month">${month}</div>
        <div class="ref">Ref ${esc(ref)}</div>
        <div class="ref">${generatedLabel}</div>
      </div>
    </header>

    <div class="cover-grid">
      <div class="score-card">
        <div class="label">Fleet health score</div>
        <div class="score">${health}<span style="font-size:22px;font-weight:600;color:#9ca3af">/100</span></div>
        <div class="sub">Compliance trend: ${healthTrend}${complianceDelta !== null && complianceDelta !== 0 ? ` (${complianceDelta > 0 ? '+' : ''}${complianceDelta}pp)` : ''}</div>
      </div>
      <div class="cover-metrics">
        <div class="metric"><div class="k">Vehicles checked</div><div class="v">${vehiclesInspected}/${totalVehicles || '—'}</div></div>
        <div class="metric"><div class="k">Critical defects</div><div class="v" style="${critical > 0 ? 'color:#d94040' : ''}">${critical}</div></div>
        <div class="metric"><div class="k">Top inspector</div><div class="v" style="font-size:16px">${topName ? esc(topName) : '—'}</div></div>
        <div class="metric"><div class="k">Needs attention</div><div class="v">${Math.max(critical, openDefects > 0 ? 1 : 0)}</div></div>
      </div>
    </div>

    <div class="exec">
      <h2>Executive summary</h2>
      <p>${executiveSummary}</p>
    </div>

    <div class="alert">
      <div>${critical > 0 ? `Action required — ${critical} critical defect(s) open at month-end` : 'All critical defects resolved'}</div>
      <div>${critical > 0 ? 'Compliance risk: high' : 'Compliance risk: monitor'}</div>
    </div>

    <section class="section">
      <p class="label">1 — Key performance indicators · ${month}</p>
      <div class="kpis">
        <div class="kpi">
          <div class="icon" style="color:#2563eb">&#10003;</div>
          <div class="v">${checks}</div>
          <div class="t">Checks completed</div>
          <div class="d" style="color:${checksColor}">${cChecks.symbol} ${cChecks.text} vs ${prev}</div>
        </div>
        <div class="kpi">
          <div class="icon" style="color:#e6a817">&#9888;</div>
          <div class="v">${reported}</div>
          <div class="t">Defects reported</div>
          <div class="d" style="color:${reportedColor}">${cReported.symbol} ${cReported.text} vs ${prev}</div>
        </div>
        <div class="kpi">
          <div class="icon" style="color:#1a7a3a">&#10003;</div>
          <div class="v">${resolved}</div>
          <div class="t">Defects resolved</div>
          <div class="d" style="color:${resolvedColor}">${cResolved.symbol} ${cResolved.text} vs ${prev}</div>
        </div>
        <div class="kpi ${critical > 0 ? 'critical' : ''}">
          <div class="icon" style="color:#d94040">&#128308;</div>
          <div class="v">${critical}</div>
          <div class="t">Critical open</div>
          <div class="d" style="color:#6b7280">${openDefects} open total</div>
        </div>
      </div>
      <div class="secondary-kpis">
        <div class="sk"><div class="v">${totalVehicles}</div><div class="t">Total vehicles</div></div>
        <div class="sk"><div class="v">${vehiclesInspected}</div><div class="t">Vehicles inspected</div></div>
        <div class="sk"><div class="v">${inspectionRate === null ? 'N/A' : `${inspectionRate}%`}</div><div class="t">Inspection rate</div></div>
        <div class="sk"><div class="v">${avgDefects}</div><div class="t">Avg defects / vehicle</div></div>
        <div class="sk"><div class="v">${avgRepair}</div><div class="t">Avg repair time</div></div>
        <div class="sk"><div class="v">${compliance}%</div><div class="t">Compliance score</div></div>
      </div>
      <div class="coverage">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:12px;color:#6b7280">Staff reporting coverage</span>
          <span style="font-size:12px;font-weight:600">${usersReported} of ${usersTotal} staff (${compliance}%)</span>
        </div>
        <div class="bar"><span style="width:${compliance}%"></span></div>
        <p class="muted-note">${usersNot} staff did not submit any checks or defects in this period</p>
      </div>
    </section>
  </div>

  <div class="page">
    <section class="section" style="padding-top:20px">
      <p class="label">2 — Trend: checks, defects reported &amp; resolved</p>
      <div class="legend">
        <span><i style="background:#2563eb"></i>Checks</span>
        <span><i style="background:#e6a817"></i>Defects reported</span>
        <span><i style="background:#1a7a3a"></i>Defects resolved</span>
      </div>
      <div class="chart-wrap"><canvas id="trend"></canvas></div>
    </section>

    <section class="section">
      <p class="label">Month-on-month comparison</p>
      <table class="compare">
        <thead>
          <tr><th>Metric</th><th>${prev}</th><th>${month}</th><th>Change</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Checks</td><td>${prevChecks}</td><td>${checks}</td>
            <td class="${checks >= prevChecks ? 'up' : 'down'}">${formatPercentChange(checks, prevChecks)}</td>
          </tr>
          <tr>
            <td>Defects reported</td><td>${prevReported}</td><td>${reported}</td>
            <td class="${reported <= prevReported ? 'up' : 'down'}">${formatPercentChange(reported, prevReported)}</td>
          </tr>
          <tr>
            <td>Defects resolved</td><td>${prevResolved}</td><td>${resolved}</td>
            <td class="${resolved >= prevResolved ? 'up' : 'down'}">${formatPercentChange(resolved, prevResolved)}</td>
          </tr>
          <tr>
            <td>Compliance</td>
            <td>${previousCompliance === null ? 'N/A' : `${previousCompliance}%`}</td>
            <td>${compliance}%</td>
            <td class="${complianceDelta === null ? '' : complianceDelta >= 0 ? 'up' : 'down'}">
              ${complianceDelta === null ? 'N/A' : `${complianceDelta >= 0 ? '+' : ''}${complianceDelta}pp`}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="section">
      <p class="label">3 — Open defects requiring action</p>
      ${
        openRows
          ? `<table>
              <colgroup>
                <col style="width:88px"><col style="width:auto"><col style="width:78px">
                <col style="width:62px"><col style="width:88px"><col style="width:62px">
              </colgroup>
              <thead>
                <tr>
                  <th>Vehicle registration</th><th>Description</th><th>Date raised</th>
                  <th>Days open</th><th>Priority</th><th>Status</th>
                </tr>
              </thead>
              <tbody>${openRows}</tbody>
            </table>${openOverflowNote}`
          : `<div style="background:#e8f5e9;border:1px solid #1a7a3a;color:#1a7a3a;border-radius:10px;padding:12px">&#128994; No open defects at month-end</div>`
      }
    </section>

    <section class="section">
      <p class="label">4 — Priority actions</p>
      <ul class="actions">${actionsHtml}</ul>
    </section>
  </div>

  <div class="page">
    <section class="section" style="padding-top:20px">
      <p class="label">5 — User check activity · ${month}</p>
      <div class="highlights">
        <div class="hl">
          <div class="k">&#127942; Top inspector</div>
          <div class="v">${topName ? esc(topName) : '—'}</div>
          <div class="s">${topChecks} inspection${topChecks === 1 ? '' : 's'} completed</div>
        </div>
        <div class="hl">
          <div class="k">&#9888; Lowest compliance</div>
          <div class="v">${usersNot}</div>
          <div class="s">staff completed no inspections</div>
        </div>
      </div>
      <div class="user-grid">
        <div>
          <h3 style="font-size:13px;margin:0 0 8px">Staff who completed checks (${usersWithChecks.length})</h3>
          <table>
            <thead><tr><th>Driver</th><th style="text-align:right">Checks</th><th style="text-align:right">Defects</th><th>Last inspection</th></tr></thead>
            <tbody>${staffRows}</tbody>
          </table>
        </div>
        <div>
          <h3 style="font-size:13px;margin:0 0 8px">No checks this month (${usersWithoutChecks.length})</h3>
          <table>
            <thead><tr><th>Driver</th></tr></thead>
            <tbody>${withoutRows}</tbody>
          </table>
        </div>
      </div>
    </section>

    <div class="meta-box">
      <h3>Report details</h3>
      <div class="meta-grid">
        <div><span>Company</span><br><strong>${companyName}</strong></div>
        <div><span>Reporting period</span><br><strong>${month}</strong></div>
        <div><span>Generated by</span><br><strong>${generatedBy}</strong></div>
        <div><span>Generated on</span><br><strong>${generatedLabel}</strong></div>
        <div><span>Report reference</span><br><strong>${esc(ref)}</strong></div>
        <div><span>Application version</span><br><strong>Stock Track PRO ${REPORT_APP_VERSION}</strong></div>
      </div>
    </div>

    <footer class="ftr">
      <div>Prepared automatically by Stock Track PRO</div>
      <div class="line">
        <span>Generated: ${generatedLabel} · Ref ${esc(ref)}</span>
        <span>Confidential Business Report · stocktrackpro.co.uk</span>
      </div>
      <div class="line">
        <span>© ${input.generatedAt.getFullYear()} Stock Track PRO Ltd</span>
        <span>Report version ${REPORT_APP_VERSION}</span>
      </div>
    </footer>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script>
const ctx = document.getElementById('trend');
function renderChart() {
  if (typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type:'bar',
      data:{labels:${chartLabels},datasets:[
        {label:'Checks',data:${chartChecks},backgroundColor:'#2563eb',minBarLength:4,borderRadius:4},
        {label:'Defects reported',data:${chartReported},backgroundColor:'#e6a817',minBarLength:4,borderRadius:4},
        {label:'Defects resolved',data:${chartResolved},backgroundColor:'#1a7a3a',minBarLength:4,borderRadius:4}
      ]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{
          x:{grid:{display:false},ticks:{autoSkip:false,maxRotation:0}},
          y:{beginAtZero:true,ticks:{stepSize:5},grid:{color:'#0000000f'}}
        }
      }
    });
    return;
  }
  const c = ctx;
  const g = c.getContext('2d');
  if (!g) return;
  const labels = ${chartLabels};
  const checks = ${chartChecks};
  const reported = ${chartReported};
  const resolved = ${chartResolved};
  const width = c.width || 720;
  const height = c.height || 220;
  g.clearRect(0, 0, width, height);
  const max = Math.max(5, ...checks, ...reported, ...resolved);
  const chartTop = 12;
  const chartBottom = height - 24;
  const chartLeft = 24;
  const chartRight = width - 8;
  const chartH = chartBottom - chartTop;
  const groupW = (chartRight - chartLeft) / Math.max(labels.length, 1);
  const barW = Math.min(12, groupW / 5);
  function drawBars(values, color, offset) {
    g.fillStyle = color;
    values.forEach((v, i) => {
      const h = Math.max(4, (v / max) * chartH);
      const x = chartLeft + i * groupW + offset;
      const y = chartBottom - h;
      g.fillRect(x, y, barW, h);
    });
  }
  drawBars(checks, '#2563eb', 6);
  drawBars(reported, '#e6a817', 6 + barW + 3);
  drawBars(resolved, '#1a7a3a', 6 + (barW + 3) * 2);
  g.fillStyle = '#6b7280';
  g.font = '11px Helvetica Neue, Helvetica, Arial, sans-serif';
  labels.forEach((l, i) => g.fillText(l, chartLeft + i * groupW + 8, height - 8));
}
setTimeout(renderChart, 80);
</script>
</body></html>`;
}

export async function buildAdminMonthlyCompanyReportHtmlPdfBytes(
  input: MonthlyCompanyReportInput
): Promise<Uint8Array> {
  const chromiumPath = await chromium.executablePath();
  const localChromeCandidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH || '',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter(Boolean);
  const localChromePath = localChromeCandidates.find((candidate) => existsSync(candidate));
  const executablePath = chromiumPath || localChromePath;
  if (!executablePath) {
    throw new Error('No Chromium executable found for PDF generation.');
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 794, height: 1123 },
    executablePath,
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });
    await page.setContent(buildHtml(input), { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return new Uint8Array(pdfBuffer);
  } finally {
    await browser.close();
  }
}
