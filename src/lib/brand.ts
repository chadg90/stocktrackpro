/**
 * Central brand constants for Fleet Track PRO.
 * Keep marketing site, SEO, and legal copy aligned from here.
 */
export const SITE_NAME = 'Fleet Track PRO';
/** Trading / operator name (not a registered limited company). */
export const SITE_LEGAL_NAME = 'Fleet Track PRO';

const DEFAULT_SITE_URL = 'https://www.fleettrackpro.co.uk';

/** Canonical marketing origin — prefer NEXT_PUBLIC_SITE_URL at build time. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  DEFAULT_SITE_URL
).replace(/\/$/, '');

export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

/** iOS App Store listing (name is Fleet Track PRO; avoid old stock-track-pro slug in URLs). */
export const APP_STORE_URL = 'https://apps.apple.com/gb/app/fleet-track-pro/id6744621973';
export const APP_STORE_ID = '6744621973';

/** Single public contact address for sales and support. */
export const SUPPORT_EMAIL = 'help@fleettrackpro.co.uk';
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;

/** Public platform availability — keep marketing, FAQ, and schema aligned. */
export const PLATFORM_AVAILABILITY =
  'iPhone app on the App Store, Android app available by invite';

/** Short pricing / feature-list wording. */
export const PLATFORM_ACCESS_PRICING = 'iPhone & Android (invite) app access';

/** Android invite CTA used under App Store badges. */
export const ANDROID_INVITE_LINE = `Android? Email ${SUPPORT_EMAIL} and we'll send you an invite.`;

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const EDITORIAL_TEAM_NAME = 'Fleet Track PRO Editorial Team';
export const EDITORIAL_TEAM_ID = `${SITE_URL}/about/#editorial-team`;

export const LOGO_WHITE = '/logo-white.png';
/** Navbar logo — 2× WebP sized for ~240×56 display (see public/logo-black.webp). */
export const LOGO_BLACK = '/logo-black.webp';
export const LOGO_DEFAULT = '/logo.png';

/** No-card web signup trial length — keep in sync with Stripe `trial_period_days`. */
export const FREE_TRIAL_DAYS = 14;
export const FREE_TRIAL_CTA = 'Start 14-Day Free Trial';
export const FREE_TRIAL_PHRASE = '14-day free trial';
export const FREE_TRIAL_PHRASE_TITLE = '14-Day Free Trial';

/** WhatsApp Business (do not print the number in marketing copy). */
export const WHATSAPP_E164 = '447438146343';

function whatsappUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

export const WHATSAPP_DEMO_CTA = 'Book a quick demo';
export const WHATSAPP_DEMO_PREFILL = "Hi, I'd like a quick demo of Fleet Track PRO.";
export const WHATSAPP_DEMO_URL = whatsappUrl(WHATSAPP_DEMO_PREFILL);

export const WHATSAPP_SUPPORT_CTA = 'Chat on WhatsApp';
export const WHATSAPP_SUPPORT_URL = whatsappUrl('Hi Fleet Track PRO, I need help with:');
