import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL

  const routes = [
    '',
    '/features',
    '/pricing',
    '/faq',
    '/contact',
    '/compliance-centre',
    '/compliance-centre/o-licence-defect-records',
    '/compliance-centre/paper-vs-digital-inspection-sheets',
    '/compliance-centre/mot-expiry-tracking-for-fleets',
    '/terms',
    '/subscription-terms',
    '/privacy',
    '/cookies',
  ]

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
