import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Prefer NEXTAUTH_URL (canonical base), fallback to NEXT_PUBLIC_APP_URL, then localhost
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api',
          '/dashboard',
          '/dashboard/',
          '/login',
          '/signup',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
