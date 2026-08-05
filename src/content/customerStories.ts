export type CustomerStory = {
  slug: string;
  company: string;
  shortName: string;
  logoSrc: string;
  logoAlt: string;
  location: string;
  fleetSize: number;
  industry: string;
  /** Short blurb for homepage card when no quote yet */
  summary: string;
  /** Named quote — omit until approved */
  quote?: string;
  quoteName?: string;
  quoteRole?: string;
  /** One-line homepage card excerpt (defaults from quote/summary) */
  cardExcerpt?: string;
  href: string;
  challenge: string;
  solution: string;
  impact: string[];
  metrics: { label: string; detail: string }[];
  howTheyUse: { title: string; body: string }[];
};

export const CUSTOMER_STORIES: CustomerStory[] = [
  {
    slug: 'newstreet',
    company: 'Newstreet Groundwork Services',
    shortName: 'Newstreet Groundworks',
    logoSrc: '/clients/newstreet-logo.png',
    logoAlt: 'Newstreet Groundwork Services',
    location: 'County Durham',
    fleetSize: 25,
    industry: 'Groundworks',
    summary:
      'A 25-vehicle County Durham groundworks fleet keeping defects, MOT and tax in one shared system across active sites.',
    quoteName: 'Newstreet Groundwork Services',
    quoteRole: 'Groundworks fleet',
    href: '/customers/newstreet',
    challenge:
      'Daily checks and defect reports lived in paper packs and WhatsApp threads. With vans across multiple live sites, the office struggled to see what had been checked, what was outstanding, and which renewals were coming due.',
    solution:
      'Drivers complete walkaround inspections in Fleet Track PRO. Defects land on My Jobs for managers and fitters, while MOT and tax status stay visible on the vehicle record so renewals are harder to miss.',
    impact: [
      'Defects reported and closed in one workflow',
      'MOT and tax tracked alongside daily checks',
      'Clearer visibility across a 25-vehicle multi-site fleet',
    ],
    metrics: [
      {
        label: '25 vehicles',
        detail: 'Fleet size managed in Fleet Track PRO',
      },
      {
        label: 'Defects in one place',
        detail: 'Raised, assigned and closed without chasing WhatsApp',
      },
      {
        label: 'MOT & tax',
        detail: 'Renewals visible on each vehicle record',
      },
    ],
    howTheyUse: [
      {
        title: 'Driver completes daily check',
        body: 'Walkaround inspections with photos before the van goes out.',
      },
      {
        title: 'Defects reported instantly',
        body: 'Managers and fitters see open jobs on My Jobs.',
      },
      {
        title: 'MOT & tax stayed on top of',
        body: 'Renewals monitored on the vehicle card, not a separate spreadsheet.',
      },
    ],
  },
  {
    slug: 'neemt',
    company: 'NEEMT Ltd',
    shortName: 'NEEMT',
    logoSrc: '/clients/neemt-logo.webp',
    logoAlt: 'NEEMT — North-East Emergency Medical Transport',
    location: 'North East England',
    fleetSize: 2,
    industry: 'Emergency medical transport',
    summary:
      'North-East Emergency Medical Transport keeps blue-light vehicles inspection-ready with digital VDIs and central vehicle records.',
    quote:
      'As a business with blue light emergency vehicles as the primary resource we offer our clients, we need to ensure all vehicles are fit for purpose and safe. Since using Fleet Track PRO, we have been able to manage all back-office items for our vehicles — including insurance, 6-weekly service records, tax and MOT validation — all in one place at the click of a finger. All our response drivers must ensure they conduct a VDI prior to using the vehicle for shift. Since moving to Fleet Track PRO the feedback from both the drivers completing the inspections to our maintenance team has been fantastic. Inspections allow us to take photographs of the vehicle and also record any issues that require rectifying.',
    quoteName: 'NEEMT Ltd',
    quoteRole: 'North-East Emergency Medical Transport',
    cardExcerpt:
      'Since using Fleet Track PRO we manage insurance, service records, tax and MOT validation all in one place — and driver VDI feedback has been fantastic.',
    href: '/customers/neemt',
    challenge:
      'NEEMT provides emergency specialist transport and courier services to the NHS and private healthcare. Blue-light vehicles must be fit for purpose every shift, with VDIs, insurance, services, tax and MOT all kept under control.',
    solution:
      'Response drivers complete vehicle defect inspections (VDIs) in Fleet Track PRO before each shift, with photos and issue logging. Back-office vehicle items — insurance, 6-weekly service records, tax and MOT — sit in one place for the team.',
    impact: [
      'Mandatory pre-shift VDIs with photo evidence',
      'Insurance, service, tax and MOT in one system',
      'Strong feedback from drivers and the maintenance team',
    ],
    metrics: [
      {
        label: '2 vehicles',
        detail: 'Blue-light emergency fleet',
      },
      {
        label: 'Pre-shift VDIs',
        detail: 'Drivers inspect before every shift',
      },
      {
        label: 'One back office',
        detail: 'Insurance, services, tax and MOT together',
      },
    ],
    howTheyUse: [
      {
        title: 'Driver completes VDI',
        body: 'Pre-shift inspection with photos before the vehicle goes out.',
      },
      {
        title: 'Issues logged clearly',
        body: 'Defects and photos reach the maintenance team straight away.',
      },
      {
        title: 'Back office in one place',
        body: 'Insurance, 6-weekly services, tax and MOT validation at a glance.',
      },
    ],
  },
];

export function getCustomerStory(slug: string): CustomerStory | undefined {
  return CUSTOMER_STORIES.find((s) => s.slug === slug);
}

export function getHomepageCustomerStories(): CustomerStory[] {
  return CUSTOMER_STORIES;
}
