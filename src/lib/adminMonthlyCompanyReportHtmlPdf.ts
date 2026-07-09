import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MonthlyCompanyReportInput } from '@/lib/adminMonthlyCompanyReportPdf';
import {
  buildRecommendedActions,
  formatDaysSinceLastCheck,
  prepareOpenDefectRowsForReport,
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
  const ref = `STP-MONTHLY-${input.generatedAt.toISOString().replace(/[-:.TZ]/g, '').slice(0, 12)}`;
  const critical = Math.round(input.criticalOpenDefects);
  const checks = Math.round(input.checksCompleted);
  const reported = Math.round(input.defectsReported);
  const resolved = Math.round(input.defectsResolved);
  const cChecks = arrow(input.comparison?.checksDelta ?? 0, true);
  const cReported = arrow(input.comparison?.defectsReportedDelta ?? 0, false);
  const cResolved = arrow(input.comparison?.defectsResolvedDelta ?? 0, true);
  const checksColor = cChecks.cls === 'good' ? '#1a7a3a' : '#d94040';
  const reportedColor = cReported.cls === 'good' ? '#1a7a3a' : '#d94040';
  const resolvedColor = cResolved.cls === 'good' ? '#1a7a3a' : '#d94040';
  const prev = esc(input.comparison?.previousMonthLabel || 'Previous month');
  const trend = (input.trend || []).slice(-4);
  const usersReported = Math.max(0, Math.round(input.usersReportedCount || 0));
  const usersNot = Math.max(0, Math.round(input.usersNotReportedCount || 0));
  const usersTotal = usersReported + usersNot;
  const coverage = usersTotal > 0 ? Math.round((usersReported / usersTotal) * 100) : 0;
  const resolutionRateText =
    input.resolutionRate === null ? 'Resolution rate: N/A' : `Resolution rate: ${input.resolutionRate}%`;
  const lastCheckText = esc(formatDaysSinceLastCheck(input.daysSinceLastCheck));
  const { rows: openDefectRows, overflowCount } = prepareOpenDefectRowsForReport(input.openDefectsList || []);
  const openRows = openDefectRows
    .map((row) => {
      const priClass = row.priority === 'critical' ? 'pri-critical' : 'pri-standard';
      return `<tr>
        <td>${esc(row.vehicle)}</td>
        <td class="desc-cell">${sanitizeText(row.description)}</td>
        <td>${esc(row.raised)}</td>
        <td><span class="badge ${priClass}">${row.priority === 'critical' ? 'Critical' : 'Standard'}</span></td>
        <td><span class="badge status-open">Open</span></td>
      </tr>`;
    })
    .join('');
  const openOverflowNote =
    overflowCount > 0
      ? `<p style="font-size:11px;color:#9ca3af;margin:8px 0 0">+ ${overflowCount} more open defect(s) not shown</p>`
      : '';
  const actions = buildRecommendedActions(input);
  const actionsHtml = actions
    .map((action, index) => `<li><span class="num">${index + 1}</span><span>${esc(action)}</span></li>`)
    .join('');
  const usersWithChecks = input.usersWithChecks || [];
  const usersWithoutChecks = input.usersWithoutChecks || [];
  const withChecksRows =
    usersWithChecks
      .map(
        (user) =>
          `<tr><td>${esc(user.name)}</td><td class="checks-count">${user.checksCompleted}</td></tr>`
      )
      .join('') || '<tr><td colspan="2" class="empty-cell">None</td></tr>';
  const withoutChecksRows =
    usersWithoutChecks
      .map((user) => `<tr><td>${esc(user.name)}</td></tr>`)
      .join('') || '<tr><td class="empty-cell">None</td></tr>';

  const chartLabels = JSON.stringify(trend.map((t) => t.month.slice(0, 3)));
  const chartChecks = JSON.stringify(trend.map((t) => Math.round(t.checks)));
  const chartReported = JSON.stringify(trend.map((t) => Math.round(t.defectsReported)));
  const chartResolved = JSON.stringify(trend.map((t) => Math.round(t.defectsResolved)));

  return `<!doctype html>
<html><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *{box-sizing:border-box} body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;color:#111827;background:#fff}
    .wrap{max-width:720px;margin:0 auto}
    .hdr{padding:16px 24px 12px;border-bottom:.5px solid #e5e7eb;display:flex;justify-content:space-between;gap:16px}
    .meta-right{text-align:right}
    .meta-right .ref{font-size:11px;color:#9ca3af}
    .alert{margin:14px 24px 0;border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;gap:12px;border:.5px solid #d94040;background:#fce8e8;color:#7a1a1a;font-size:13px}
    .alert-note{font-size:11px;margin-top:4px;opacity:.9}
    .section{padding:14px 24px 0}
    .label{font-size:11px;letter-spacing:.06em;color:#6b7280;text-transform:uppercase;margin:0 0 12px}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .card{background:#f9fafb;border-radius:8px;padding:10px 12px}
    .card.critical{background:#fce8e8}
    .card .v{font-size:20px;font-weight:500}
    .coverage{margin-top:8px;background:#f9fafb;border:.5px solid #e5e7eb;border-radius:8px;padding:8px 12px}
    .bar{height:6px;background:#e5e7eb;border-radius:3px}.bar>span{display:block;height:6px;background:#3b82f6;border-radius:3px}
    .legend{display:flex;gap:14px;font-size:12px;color:#6b7280;margin-bottom:8px}
    .legend i{width:10px;height:10px;border-radius:2px;display:inline-block;margin-right:6px}
    table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:13px}
    th,td{padding:5px 0;border-bottom:.5px solid #e5e7eb;text-align:left;vertical-align:top}
    tr:last-child td{border-bottom:0}
    .desc-cell{line-height:1.4}
    .desc-cell br{margin:0;padding:0;line-height:inherit}
    .badge{padding:2px 7px;border-radius:999px;font-size:11px}
    .pri-critical{background:#fce8e8;color:#a03030}.pri-standard{background:#fff3cd;color:#7a4a00}.status-open{background:#fff3cd;color:#7a4a00}
    .actions{padding-bottom:0}.actions li{padding:6px 0;margin:0;list-style:none;display:flex;gap:10px}
    .num{width:20px;height:20px;border-radius:50%;background:#3b82f6;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px}
    .ftr{margin:12px 24px 0;padding:14px 0;border-top:.5px solid #e5e7eb;color:#6b7280;font-size:11px;display:flex;justify-content:space-between}
    .user-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .user-panel h3{font-size:13px;margin:0 0 8px;color:#111827}
    .checks-count{text-align:right;font-weight:600;color:#3b82f6;width:56px}
    .empty-cell{color:#9ca3af}
    .user-activity-section{page-break-before:always;padding-top:18px}
    @media print {
      .section { page-break-inside: avoid; }
      .defects-table-wrap { page-break-inside: avoid; }
      .actions-section { page-break-inside: avoid; }
      .user-activity-section { page-break-before: always; page-break-inside: avoid; }
      .report-footer { page-break-before: avoid; }
    }
  </style>
</head><body>
<div class="wrap">
  <header class="hdr">
    <div style="display:flex; align-items:center; gap:10px;">
      <img
        src="${logoSrc}"
        style="width:220px; height:auto; max-height:56px; object-fit:contain;
          flex-shrink:0;"
        alt="Stock Track PRO logo"
      />
    </div>
    <div class="meta-right">
      <div style="font-weight:700">${companyName}</div><div>${month}</div><div class="ref">Ref ${ref}</div><div>${input.generatedAt.toLocaleDateString('en-GB')}</div>
    </div>
  </header>
  <div class="alert"><div><div>${critical > 0 ? `Action required — ${critical} critical defect(s) open at month-end` : 'All critical defects resolved'}</div><div class="alert-note">${lastCheckText}</div></div><div>${critical > 0 ? 'Compliance risk: high · See section 3' : 'Compliance risk: amber'}</div></div>

  <section class="section">
    <p class="label">1 — Key performance indicators · ${month}</p>
    <div class="kpis">
      <div class="card"><div style="font-size:11px;color:#6b7280">Checks completed</div><div class="v">${checks}</div><p style="font-size:11px; margin:4px 0 0; color:${checksColor};">${cChecks.symbol} ${cChecks.text} vs ${prev}</p></div>
      <div class="card"><div style="font-size:11px;color:#6b7280">Defects reported</div><div class="v">${reported}</div><p style="font-size:11px; margin:4px 0 0; color:${reportedColor};">${cReported.symbol} ${cReported.text} vs ${prev}</p></div>
      <div class="card"><div style="font-size:11px;color:#6b7280">Defects resolved</div><div class="v">${resolved}</div><p style="font-size:11px; margin:4px 0 0; color:${resolvedColor};">${cResolved.symbol} ${cResolved.text} vs ${prev}</p><p style="font-size:10px;margin:4px 0 0;color:#6b7280">${esc(resolutionRateText)}</p></div>
      <div class="card ${critical > 0 ? 'critical' : ''}"><div style="font-size:11px;${critical > 0 ? 'color:#a03030' : 'color:#6b7280'}">Critical open defects</div><div class="v" style="${critical > 0 ? 'color:#d94040' : ''}">${critical}</div></div>
    </div>
    <div class="coverage"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;color:#6b7280">Staff reporting coverage</span><span style="font-size:12px;font-weight:500">${usersReported} of ${usersTotal} staff submitted (${coverage}%)</span></div><div class="bar"><span style="width:${coverage}%"></span></div><p style="font-size:11px;color:#9ca3af;margin:6px 0 0">${usersNot} staff did not submit any checks or defects in this period</p></div>
  </section>

  <section class="section">
    <p class="label">2 — Trend: checks, defects reported & resolved</p>
    <div class="legend"><span><i style="background:#3b82f6"></i>Checks</span><span><i style="background:#e6a817"></i>Defects reported</span><span><i style="background:#1a7a3a"></i>Defects resolved</span></div>
    <div style="position:relative; width:100%; height:140px;">
      <canvas id="trend"></canvas>
    </div>
  </section>

  <section class="section defects-table-wrap">
    <p class="label">3 — Open defects requiring action</p>
    ${openRows ? `<table><colgroup><col style="width:90px"><col style="width:auto"><col style="width:90px"><col style="width:65px"><col style="width:65px"></colgroup><thead><tr><th>Vehicle</th><th>Defect description</th><th>Date raised</th><th>Priority</th><th>Status</th></tr></thead><tbody>${openRows}</tbody></table>${openOverflowNote}` : `<div style="background:#e8f5e9;border:.5px solid #1a7a3a;color:#1a7a3a;border-radius:8px;padding:10px">No open defects at month-end</div>`}
  </section>

  <section class="section actions actions-section">
    <p class="label">4 — Recommended actions</p>
    <ul>${actionsHtml}</ul>
  </section>

  <section class="section user-activity-section">
    <p class="label">5 — User check activity · ${month}</p>
    <p style="font-size:12px;color:#6b7280;margin:-6px 0 12px">Drivers and managers expected to complete vehicle checks.</p>
    <div class="user-grid">
      <div class="user-panel">
        <h3>Completed checks (${usersWithChecks.length})</h3>
        <table>
          <thead><tr><th>Name</th><th style="text-align:right">Checks</th></tr></thead>
          <tbody>${withChecksRows}</tbody>
        </table>
      </div>
      <div class="user-panel">
        <h3>No checks this month (${usersWithoutChecks.length})</h3>
        <table>
          <thead><tr><th>Name</th></tr></thead>
          <tbody>${withoutChecksRows}</tbody>
        </table>
      </div>
    </div>
  </section>

  <footer class="ftr report-footer"><div>Confidential — prepared for operational review · <span style="color:#3b82f6">stocktrackpro.co.uk</span></div><div>© 2026 Stock Track PRO Ltd</div></footer>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script>
const ctx = document.getElementById('trend');
function renderChart() {
  if (typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type:'bar',
      data:{labels:${chartLabels},datasets:[
        {label:'Checks',data:${chartChecks},backgroundColor:'#3b82f6',minBarLength:4,borderRadius:4},
        {label:'Defects reported',data:${chartReported},backgroundColor:'#e6a817',minBarLength:4,borderRadius:4},
        {label:'Defects resolved',data:${chartResolved},backgroundColor:'#1a7a3a',minBarLength:4,borderRadius:4}
      ]},
      options:{plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{autoSkip:false,maxRotation:0}},y:{beginAtZero:true,ticks:{stepSize:5},grid:{color:'#0000000f'}}}}
    });
    return;
  }

  // Fallback render so PDF generation does not fail if CDN load is blocked.
  const c = ctx;
  const g = c.getContext('2d');
  if (!g) return;
  const labels = ${chartLabels};
  const checks = ${chartChecks};
  const reported = ${chartReported};
  const resolved = ${chartResolved};
  const width = c.width || 720;
  const height = c.height || 180;
  g.clearRect(0, 0, width, height);
  const max = Math.max(5, ...checks, ...reported, ...resolved);
  const chartTop = 12;
  const chartBottom = height - 24;
  const chartLeft = 20;
  const chartRight = width - 8;
  const chartH = chartBottom - chartTop;
  const groupW = (chartRight - chartLeft) / labels.length;
  const barW = Math.min(8, groupW / 5);
  function drawBars(values, color, offset) {
    g.fillStyle = color;
    values.forEach((v, i) => {
      const h = Math.max(4, (v / max) * chartH);
      const x = chartLeft + i * groupW + offset;
      const y = chartBottom - h;
      g.fillRect(x, y, barW, h);
    });
  }
  drawBars(checks, '#3b82f6', 4);
  drawBars(reported, '#e6a817', 4 + barW + 2);
  drawBars(resolved, '#1a7a3a', 4 + (barW + 2) * 2);
  g.fillStyle = '#6b7280';
  g.font = '11px Helvetica Neue, Helvetica, Arial, sans-serif';
  labels.forEach((l, i) => g.fillText(l, chartLeft + i * groupW + 6, height - 8));
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
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
    return new Uint8Array(pdfBuffer);
  } finally {
    await browser.close();
  }
}

