import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import type { MonthlyCompanyReportInput } from '@/lib/adminMonthlyCompanyReportPdf';

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
  const openRows = (input.openDefectsList || [])
    .filter((d) => d.status === 'open')
    .map((row) => {
      const priClass = row.priority === 'critical' ? 'pri-critical' : 'pri-standard';
      return `<tr>
        <td>${esc(row.vehicle)}</td>
        <td>${sanitizeText(row.description)}</td>
        <td>${esc(row.raised)}</td>
        <td><span class="badge ${priClass}">${row.priority === 'critical' ? 'Critical' : 'Standard'}</span></td>
        <td><span class="badge status-open">Open</span></td>
      </tr>`;
    })
    .join('');

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
    .wrap{max-width:720px;margin:0 auto;padding:0 24px}
    .hdr{padding:20px 0 16px;border-bottom:.5px solid #e5e7eb;display:flex;justify-content:space-between;gap:16px}
    .brand{display:flex;gap:10px;align-items:flex-start}
    .meta-right{text-align:right}
    .meta-right .ref{font-size:11px;color:#9ca3af}
    .alert{margin-top:16px;border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;border:.5px solid #d94040;background:#fce8e8;color:#7a1a1a;font-size:13px}
    .section{padding-top:20px}
    .label{font-size:11px;letter-spacing:.06em;color:#6b7280;text-transform:uppercase;margin:0 0 12px}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .card{background:#f9fafb;border-radius:8px;padding:12px 14px}
    .card.critical{background:#fce8e8}
    .card .v{font-size:22px;font-weight:500}
    .coverage{margin-top:12px;background:#f9fafb;border:.5px solid #e5e7eb;border-radius:8px;padding:12px 14px}
    .bar{height:6px;background:#e5e7eb;border-radius:3px}.bar>span{display:block;height:6px;background:#1a56db;border-radius:3px}
    .legend{display:flex;gap:14px;font-size:12px;color:#6b7280;margin-bottom:8px}
    .legend i{width:10px;height:10px;border-radius:2px;display:inline-block;margin-right:6px}
    table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:13px}
    th,td{padding:9px 8px;border-bottom:.5px solid #e5e7eb;text-align:left;vertical-align:top}
    tr:last-child td{border-bottom:0}
    .badge{padding:2px 7px;border-radius:999px;font-size:11px}
    .pri-critical{background:#fce8e8;color:#a03030}.pri-standard{background:#fff3cd;color:#7a4a00}.status-open{background:#fff3cd;color:#7a4a00}
    .actions{padding-bottom:0}.actions li{margin:0 0 10px;list-style:none;display:flex;gap:10px}.actions li:last-child{margin-bottom:0}
    .num{width:20px;height:20px;border-radius:50%;background:#1a56db;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px}
    .ftr{margin-top:20px;padding:14px 0;border-top:.5px solid #e5e7eb;color:#6b7280;font-size:11px;display:flex;justify-content:space-between}
    @media print {
      .section { page-break-inside: avoid; }
      .defects-table { page-break-inside: avoid; }
      .actions-list { page-break-inside: avoid; }
      .footer { page-break-before: avoid; }
    }
  </style>
</head><body>
<div class="wrap">
  <header class="hdr">
    <div style="display:flex; align-items:center; gap:10px; flex-shrink:0; background:#000; padding:2px; border-radius:10px;">
      <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
        <div style="width:36px; height:36px; min-width:36px; background:#1a56db;
          border-radius:8px; display:flex; align-items:center;
          justify-content:center; flex-shrink:0;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white"
              opacity="0.6"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white"
              opacity="0.6"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white"
              opacity="0.35"/>
          </svg>
        </div>
        <div>
          <div style="font-size:14px; font-weight:500; color:#111827;
            line-height:1.2;">Stock Track PRO</div>
          <div style="font-size:11px; color:#6b7280;
            line-height:1.2;">Monthly fleet performance report</div>
        </div>
      </div>
    </div>
    <div class="meta-right">
      <div style="font-weight:700">${companyName}</div><div>${month}</div><div class="ref">Ref ${ref}</div><div>${input.generatedAt.toLocaleDateString('en-GB')}</div>
    </div>
  </header>
  <div class="alert"><div>${critical > 0 ? `Action required — ${critical} critical defect(s) open at month-end` : 'All critical defects resolved'}</div><div>${critical > 0 ? 'Compliance risk: high · See section 3' : 'Compliance risk: amber'}</div></div>

  <section class="section">
    <p class="label">1 — Key performance indicators · ${month}</p>
    <div class="kpis">
      <div class="card"><div style="font-size:11px;color:#6b7280">Checks completed</div><div class="v">${checks}</div><p style="font-size:11px; margin:4px 0 0; color:${checksColor};">${cChecks.symbol} ${cChecks.text} vs ${prev}</p></div>
      <div class="card"><div style="font-size:11px;color:#6b7280">Defects reported</div><div class="v">${reported}</div><p style="font-size:11px; margin:4px 0 0; color:${reportedColor};">${cReported.symbol} ${cReported.text} vs ${prev}</p></div>
      <div class="card"><div style="font-size:11px;color:#6b7280">Defects resolved</div><div class="v">${resolved}</div><p style="font-size:11px; margin:4px 0 0; color:${resolvedColor};">${cResolved.symbol} ${cResolved.text} vs ${prev}</p></div>
      <div class="card ${critical > 0 ? 'critical' : ''}"><div style="font-size:11px;${critical > 0 ? 'color:#a03030' : 'color:#6b7280'}">Critical open defects</div><div class="v" style="${critical > 0 ? 'color:#d94040' : ''}">${critical}</div></div>
    </div>
    <div class="coverage"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;color:#6b7280">User reporting coverage</span><span style="font-size:12px;font-weight:500">${usersReported} of ${usersTotal} users submitted (${coverage}%)</span></div><div class="bar"><span style="width:${coverage}%"></span></div><p style="font-size:11px;color:#9ca3af;margin:6px 0 0">${usersNot} users did not submit any checks or defects in this period</p></div>
  </section>

  <section class="section">
    <p class="label">2 — Trend: checks, defects reported & resolved</p>
    <div class="legend"><span><i style="background:#1a56db"></i>Checks</span><span><i style="background:#e6a817"></i>Defects reported</span><span><i style="background:#1a7a3a"></i>Defects resolved</span></div>
    <div style="position:relative; width:100%; height:160px;">
      <canvas id="trend"></canvas>
    </div>
  </section>

  <section class="section defects-table">
    <p class="label">3 — Open defects requiring action</p>
    ${openRows ? `<table><colgroup><col style="width:90px"><col style="width:auto"><col style="width:90px"><col style="width:65px"><col style="width:65px"></colgroup><thead><tr><th>Vehicle</th><th>Defect description</th><th>Date raised</th><th>Priority</th><th>Status</th></tr></thead><tbody>${openRows}</tbody></table>` : `<div style="background:#e8f5e9;border:.5px solid #1a7a3a;color:#1a7a3a;border-radius:8px;padding:10px">No open defects at month-end</div>`}
  </section>

  <section class="section actions actions-list">
    <p class="label">4 — Recommended actions</p>
    <ul>
      <li><span class="num">1</span><span>${critical > 0 ? `Resolve ${critical} critical defect(s) immediately. Confirm repair and close in Stock Track PRO before further vehicle use.` : 'Continue daily checks and resolve raised defects within agreed SLA.'}</span></li>
      <li><span class="num">2</span><span>${(input.comparison?.checksDelta ?? 0) >= 0 ? `Maintain inspection frequency. ${month}'s ${checks} checks (+${Math.round(input.comparison?.checksDelta ?? 0)} on ${prev}) is a strong result.` : `Inspection frequency dropped by ${Math.abs(Math.round(input.comparison?.checksDelta ?? 0))} this month. Ensure all drivers are completing checks via the Stock Track PRO app.`}</span></li>
      <li><span class="num">3</span><span>${(input.resolutionRate ?? 0) > 100 ? `Monitor resolution backlog. The ${Math.round(input.resolutionRate || 0)}% resolution rate reflects clearance of prior-month defects — aim to keep open defects below 3.` : 'Review unresolved defects weekly and assign owners with due dates.'}</span></li>
    </ul>
  </section>

  <footer class="ftr footer"><div>Confidential — prepared for operational review · <span style="color:#1a56db">stocktrackpro.co.uk</span></div><div>© 2026 Stock Track PRO Ltd</div></footer>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script>
const ctx = document.getElementById('trend');
function renderChart() {
  if (typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type:'bar',
      data:{labels:${chartLabels},datasets:[
        {label:'Checks',data:${chartChecks},backgroundColor:'#1a56db',minBarLength:4,borderRadius:4},
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
  drawBars(checks, '#1a56db', 4);
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

export async function buildAdminMonthlyCompanyReportHtmlPdfBytes(input: MonthlyCompanyReportInput): Promise<Uint8Array> {
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

