import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://stocktrackpro.com'
  
  // List all static routes
  const routes = [
    '',
    '/benefits',
    '/pricing',
    '/contact',
    '/privacy',
    '/cookies',
    '/terms'
  ]

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
} 