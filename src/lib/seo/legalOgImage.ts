/** Shared static OG/Twitter image for legal pages (no people / number plates). */
export const LEGAL_OG_IMAGE = {
  url: '/og/legal.png',
  width: 1200,
  height: 630,
  alt: 'Fleet Track PRO legal',
} as const;

export const LEGAL_OG_IMAGES = [LEGAL_OG_IMAGE] as const;
export const LEGAL_TWITTER_IMAGES = [LEGAL_OG_IMAGE.url] as const;
