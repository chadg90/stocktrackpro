/**
 * Gradual click-through demo for the marketing site.
 * Add screens as screenshots arrive; hotspots use % of the phone screen.
 */

export type DemoHotspot = {
  id: string;
  /** Percent of screen width from left */
  left: number;
  /** Percent of screen height from top */
  top: number;
  /** Percent of screen width */
  width: number;
  /** Percent of screen height */
  height: number;
  label: string;
  /** Tooltip shown above the hotspot */
  hint: string;
  /** Id of the next step, or null when that screen is not ready yet */
  nextStepId: string | null;
};

export type DemoGuide = {
  title: string;
  items: { label: string; detail: string }[];
  continueLabel: string;
};

export type DemoCallout = {
  ring: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  note: string;
  /** Optional line shown under the note pill */
  detail?: string;
  /** Keep Continue under the ring even on low screens */
  continueBelow?: boolean;
  /** Keep Continue just above the ring */
  continueAboveRing?: boolean;
  continueLabel: string;
  /** When set with no next step, links out to end the demo (e.g. signup) */
  continueHref?: string;
  nextStepId: string | null;
};

export type DemoStep = {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  /** Shown first; hotspots appear after the visitor continues */
  guide?: DemoGuide;
  /** Inline ring + note + continue — no full-screen popup */
  callout?: DemoCallout;
  hotspots: DemoHotspot[];
};

export const INTERACTIVE_DEMO_STEPS: DemoStep[] = [
  {
    id: 'login',
    title: 'Login',
    imageSrc: '/demo/01-login.png',
    imageAlt: 'Fleet Track PRO login screen — Welcome Back, sign in to manage your fleet',
    hotspots: [
      {
        id: 'sign-in',
        // Measured against 01-login.png Sign In button pixels
        left: 8.5,
        top: 51.7,
        width: 83,
        height: 5.1,
        label: 'Sign In',
        hint: 'Tap Sign In - Start Demo',
        nextStepId: 'home',
      },
    ],
  },
  {
    id: 'home',
    title: 'Home',
    imageSrc: '/demo/02-home.jpg',
    imageAlt:
      'Fleet Track PRO home screen — welcome card, quick actions, and bottom navigation',
    guide: {
      title: 'Bottom navigation',
      items: [
        { label: 'Check', detail: 'Perform a vehicle check' },
        { label: 'Fleet', detail: 'See inspections you have carried out' },
        { label: 'Account', detail: 'Manage account' },
      ],
      continueLabel: 'Continue',
    },
    hotspots: [
      {
        id: 'nav-check',
        // Check tab in bottom navigation (2nd of 4)
        left: 25,
        top: 90.2,
        width: 25,
        height: 8.2,
        label: 'Check',
        hint: "Let's perform a check",
        nextStepId: 'select-vehicle',
      },
    ],
  },
  {
    id: 'select-vehicle',
    title: 'Select vehicle',
    imageSrc: '/demo/03-select-vehicle.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — Select Vehicle step with 3 vehicles available',
    hotspots: [
      {
        id: 'tap-select-vehicle',
        // Measured against 03-select-vehicle.png field
        left: 4.7,
        top: 24.8,
        width: 90.7,
        height: 6.2,
        label: 'Select Vehicle',
        hint: 'Select Vehicle',
        nextStepId: 'pick-vehicle',
      },
    ],
  },
  {
    id: 'pick-vehicle',
    title: 'Pick a vehicle',
    imageSrc: '/demo/04-pick-vehicle.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — choose from TE21EST, NU12VAN, or TE72EST',
    guide: {
      title: 'Note',
      items: [
        {
          label: 'Inspection template',
          detail: 'Inspection templates are vehicle specific.',
        },
      ],
      continueLabel: 'Continue',
    },
    hotspots: [
      {
        id: 'vehicle-te21est',
        // First vehicle row (TE21EST) — measured against 04-pick-vehicle.png list item
        left: 7.9,
        top: 30.9,
        width: 84.1,
        height: 7.5,
        label: 'TE21EST',
        hint: 'Select this vehicle',
        nextStepId: 'vehicle-selected',
      },
    ],
  },
  {
    id: 'vehicle-selected',
    title: 'Vehicle selected',
    imageSrc: '/demo/05-vehicle-selected.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — TE21EST selected with MOT/TAX status and photo slots',
    callout: {
      ring: {
        // MOT + TAX status rows — measured against 05-vehicle-selected.png
        left: 4,
        top: 37.4,
        width: 92,
        height: 32,
      },
      note: 'View MOT/Tax',
      continueLabel: 'Continue',
      nextStepId: 'inspection-form',
    },
    hotspots: [],
  },
  {
    id: 'inspection-form',
    title: 'Inspection form',
    imageSrc: '/demo/06-inspection-photos.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — Take Photos with 6 required photo slots',
    callout: {
      ring: {
        // 6 photo slots — measured against 06-inspection-photos.png
        left: 4,
        top: 17.5,
        width: 92,
        height: 52,
      },
      note: 'Add photos',
      detail: 'Users add 6 images here in total.',
      continueLabel: 'Continue',
      nextStepId: 'inspection-mileage',
    },
    hotspots: [],
  },
  {
    id: 'inspection-mileage',
    title: 'Current mileage',
    imageSrc: '/demo/06-inspection-photos.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — current mileage entry during inspection',
    callout: {
      ring: {
        // Current Mileage card — measured against 06-inspection-photos.png
        left: 4,
        top: 74,
        width: 92,
        height: 12.5,
      },
      note: 'Current Mileage',
      continueBelow: true,
      continueLabel: 'Continue',
      nextStepId: 'vehicle-checks',
    },
    hotspots: [],
  },
  {
    id: 'vehicle-checks',
    title: 'Vehicle checks',
    imageSrc: '/demo/07-vehicle-checks.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — Cab checks complete and Under the Bonnet section',
    callout: {
      ring: {
        // Cab section — measured against 07-vehicle-checks.png
        left: 3,
        top: 14,
        width: 94,
        height: 55,
      },
      note: 'Vehicle check list',
      continueLabel: 'Continue',
      nextStepId: 'vehicle-checks-edit',
    },
    hotspots: [],
  },
  {
    id: 'vehicle-checks-edit',
    title: 'Vehicle checks',
    imageSrc: '/demo/07-vehicle-checks.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — reopen or edit a completed Cab section',
    callout: {
      ring: {
        // Reopen / edit section — measured against 07-vehicle-checks.png
        left: 4,
        top: 58,
        width: 92,
        height: 11,
      },
      note: 'Edit a selection',
      continueLabel: 'Continue',
      nextStepId: 'under-the-bonnet',
    },
    hotspots: [],
  },
  {
    id: 'under-the-bonnet',
    title: 'Under the Bonnet',
    imageSrc: '/demo/08-under-the-bonnet.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — Under the Bonnet fluid and leak checks',
    callout: {
      ring: {
        // Under the Bonnet section — measured against 08-under-the-bonnet.png
        left: 4,
        top: 14,
        width: 92,
        height: 72,
      },
      note: 'Edit Selections',
      continueBelow: true,
      continueLabel: 'Continue',
      nextStepId: 'under-bonnet-checks',
    },
    hotspots: [],
  },
  {
    id: 'under-bonnet-checks',
    title: 'Under the Bonnet checks',
    imageSrc: '/demo/09-under-bonnet-checks.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — bonnet checks complete with Save section',
    callout: {
      ring: {
        // Mark remaining as OK + Save section — measured against 09-under-bonnet-checks.png
        left: 4,
        top: 69,
        width: 92,
        height: 14,
      },
      note: 'Save section',
      continueBelow: true,
      continueLabel: 'Continue',
      nextStepId: 'exterior-defect',
    },
    hotspots: [],
  },
  {
    id: 'exterior-defect',
    title: 'Exterior defect',
    imageSrc: '/demo/10-exterior-defect.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — Exterior & Load defect found with severity and photo',
    callout: {
      ring: {
        // Bodywork defect details — measured against 10-exterior-defect.png
        left: 4,
        top: 14,
        width: 92,
        height: 71,
      },
      note: 'Found a defect',
      continueBelow: true,
      continueLabel: 'Continue',
      nextStepId: 'select-defect-options',
    },
    hotspots: [],
  },
  {
    id: 'select-defect-options',
    title: 'Select defect options',
    imageSrc: '/demo/11-select-defect-options.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — select severity and vehicle status for a defect',
    callout: {
      ring: {
        // Same ring as screen 10 — measured against 10-exterior-defect.png
        left: 4,
        top: 27,
        width: 92,
        height: 71,
      },
      note: 'Select defect options',
      continueAboveRing: true,
      continueLabel: 'Continue',
      nextStepId: 'declarations-submit',
    },
    hotspots: [],
  },
  {
    id: 'declarations-submit',
    title: 'Declarations and Submit',
    imageSrc: '/demo/12-declarations-submit.png',
    imageAlt:
      'Fleet Track PRO vehicle inspection — declaration confirmations and Confirm & Submit',
    callout: {
      ring: {
        // Declaration card + Confirm & Submit — measured against 12-declarations-submit.png
        left: 4,
        top: 57,
        width: 92,
        height: 34,
      },
      note: 'Declarations and Submit',
      continueBelow: true,
      continueLabel: 'Continue',
      nextStepId: 'inspection-complete',
    },
    hotspots: [],
  },
  {
    id: 'inspection-complete',
    title: 'Inspection Complete',
    imageSrc: '/demo/13-inspection-complete.jpg',
    imageAlt:
      'Fleet Track PRO vehicle inspection — success confirmation after submit',
    callout: {
      ring: {
        // Success dialog — measured against 13-inspection-complete.jpg
        left: 6,
        top: 36,
        width: 88,
        height: 28,
      },
      note: 'Inspection Complete',
      continueLabel: 'Start Free Trial',
      continueHref: '/onboarding',
      nextStepId: null,
    },
    hotspots: [],
  },
];

export const INTERACTIVE_DEMO_START_ID = 'login';
