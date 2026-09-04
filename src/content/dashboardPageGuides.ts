export type DashboardGuidePageId =
  | 'home'
  | 'fleet'
  | 'defects'
  | 'mot-tax'
  | 'fleet-report'
  | 'inspection-proof'
  | 'vehicle-reports'
  | 'history'
  | 'team'
  | 'subscription';

export type DashboardGuideStep = {
  target: string;
  title: string;
  body: string;
};

export const DASHBOARD_PAGE_GUIDES: Record<DashboardGuidePageId, DashboardGuideStep[]> = {
  home: [
    {
      target: '[data-tour="home-attention"]',
      title: 'Start here each morning',
      body: 'Needs attention lists MOT or tax due soon, open defects, and mileage to review — so you know what to deal with first.',
    },
    {
      target: '[data-tour="home-kpis"]',
      title: 'Fleet snapshot',
      body: 'These cards show vehicle count, open defects, inspections, and MOT/tax due. Tap a card to open that page.',
    },
    {
      target: '[data-tour="home-period"]',
      title: 'Change the period',
      body: 'Charts and activity follow this date range. Export is a snapshot of what you can see here.',
    },
  ],
  fleet: [
    {
      target: '[data-tour="fleet-add"]',
      title: 'Add a vehicle',
      body: 'Add vans by registration. DVLA details fill in automatically so you do not type make and model by hand.',
    },
    {
      target: '[data-tour="fleet-search"]',
      title: 'Find a van quickly',
      body: 'Search by registration, make, or model when the list gets long.',
    },
    {
      target: '[data-tour="fleet-table"]',
      title: 'Status and history',
      body: 'Each row is a vehicle. Status shows if it is active or in maintenance. Open a van to see inspections and defects.',
    },
  ],
  defects: [
    {
      target: '[data-tour="defects-filters"]',
      title: 'Open vs closed jobs',
      body: 'Pending is work still to close. Resolved is finished. Use All when you need the full history.',
    },
    {
      target: '[data-tour="defects-table"]',
      title: 'Track through to close-out',
      body: 'Each defect shows the vehicle, severity, and status. Update it as it is scheduled, waiting for parts, or completed so the van can return to service.',
    },
  ],
  'mot-tax': [
    {
      target: '[data-tour="mot-kpis"]',
      title: 'Who is due soon',
      body: 'Expired and Urgent (7 days) need action first. Due soon is your planning window.',
    },
    {
      target: '[data-tour="mot-filters"]',
      title: 'Filter the list',
      body: 'Needs attention hides vans that are fine so you can work the risk list.',
    },
    {
      target: '[data-tour="mot-refresh"]',
      title: 'Refresh from DVLA',
      body: 'Dates sync once a day. Use Refresh on a vehicle row if you have just taxed or MOTed it. Open How refreshing works for the daily limits.',
    },
  ],
  'fleet-report': [
    {
      target: '[data-tour="report-nav"]',
      title: 'Report sections',
      body: 'Overview, mileage, this week, and who checked. Use these tabs instead of exporting first.',
    },
    {
      target: '[data-tour="report-export"]',
      title: 'Excel for audits',
      body: 'Export full Excel downloads summary, mileage, defects, the week log, and compliance in one file.',
    },
  ],
  'inspection-proof': [
    {
      target: '[data-tour="proof-vehicle"]',
      title: 'Pick the vehicle',
      body: 'Choose a registration to see its inspections. Then open any check as a PDF with photos and checklist answers.',
    },
  ],
  'vehicle-reports': [
    {
      target: '[data-tour="packs-vehicle"]',
      title: 'Choose a vehicle',
      body: 'Select a van, upload MOT or service documents, then download a 6- or 12-month evidence pack for clients.',
    },
    {
      target: '[data-tour="packs-download"]',
      title: 'Evidence packs',
      body: 'Packs include a summary PDF plus the original files in that window. They are built on demand — nothing extra is stored.',
    },
  ],
  history: [
    {
      target: '[data-tour="history-search"]',
      title: 'Search the audit trail',
      body: 'Find inspections by vehicle, inspector, or defect status. This is the dated record of who checked what.',
    },
    {
      target: '[data-tour="history-table"]',
      title: 'Inspection history',
      body: 'Each row is a submitted check. Thumbnails load as you scroll. Export if you need a file copy.',
    },
  ],
  team: [
    {
      target: '[data-tour="team-invite"]',
      title: 'Invite your drivers',
      body: 'Invite by email. User is for drivers (mobile app). Manager is for office staff who need this dashboard.',
    },
    {
      target: '[data-tour="team-table"]',
      title: 'Roles and access',
      body: 'Change someone’s role or remove them here. Drivers never see billing.',
    },
  ],
  subscription: [
    {
      target: '[data-tour="sub-status"]',
      title: 'Plan and vehicles',
      body: 'You pay per vehicle, not per user. This card shows how many vehicles you are billed for and trial or paid status.',
    },
    {
      target: '[data-tour="sub-billing"]',
      title: 'Cards and invoices',
      body: 'Manage Billing Portal opens Stripe for payment method, invoices, and cancellation. Vehicle quantity is changed from this page or support.',
    },
  ],
};
