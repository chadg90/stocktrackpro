import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL
  const lastModified = new Date()

  const routes = [
    '',
    '/features',
    '/about',
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

  return routes.map((route) => {
    const isArticle = route.startsWith('/compliance-centre/')
    return {
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: route === '' ? 1 : isArticle ? 0.8 : 0.7,
    }
  })
}
