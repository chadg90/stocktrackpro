import {
  HOME_HERO_POSTER_SRC,
  HOME_HERO_VIDEO_DESCRIPTION,
  HOME_HERO_VIDEO_SRC,
} from '@/content/homeHero';
import { SITE_NAME } from '@/lib/brand';
import { SITE_URL } from '@/lib/site';

/**
 * Homepage VideoObject for the product demo MP4.
 * uploadDate must be full ISO 8601 with timezone (Search Console Videos).
 */
export function HomeVideoJsonLd() {
  const video = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${SITE_URL}/#hero-video`,
    name: `${SITE_NAME} mobile app demonstration`,
    description: HOME_HERO_VIDEO_DESCRIPTION,
    thumbnailUrl: `${SITE_URL}${HOME_HERO_POSTER_SRC}`,
    contentUrl: `${SITE_URL}${HOME_HERO_VIDEO_SRC}`,
    uploadDate: '2026-07-06T09:00:00+01:00',
    inLanguage: 'en-GB',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(video) }} />
  );
}
