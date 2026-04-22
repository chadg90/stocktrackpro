import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://stocktrackpro.co.uk'

  const routes = [
    '',
    '/features',
    '/pricing',
    '/faq',
    '/contact',
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
