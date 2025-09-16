import type { MetadataRoute } from 'next'
import { getArtworksCollection } from '@/lib/db/artworks'
import { getUsersCollection } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Prefer NEXTAUTH_URL (canonical base), fallback to NEXT_PUBLIC_APP_URL, then localhost
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Core public, indexable pages
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/explore`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/artists`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/about`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/about/faq`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/commissions`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Dynamic: artworks and artists (cap to avoid huge sitemaps)
  const LIMIT = 5000
  let artworks: Array<{ _id: unknown; createdAt?: Date; updatedAt?: Date }> = []
  let artists: Array<{ _id: unknown; createdAt?: Date; updatedAt?: Date }> = []
  try {
    [artworks, artists] = await Promise.all([
      (await getArtworksCollection())
        .find({}, { projection: { _id: 1, createdAt: 1, updatedAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(LIMIT)
        .toArray(),
      (await getUsersCollection())
        .find({ role: 'ARTIST' }, { projection: { _id: 1, createdAt: 1, updatedAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(LIMIT)
        .toArray(),
    ])
  } catch {
    // If DB is unavailable (e.g., during preview builds), fall back to static URLs only.
  }

  const artworkUrls: MetadataRoute.Sitemap = artworks.map((doc) => ({
    url: `${base}/artwork/${String(doc._id)}`,
    lastModified: (doc as any).updatedAt || (doc as any).createdAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const artistUrls: MetadataRoute.Sitemap = artists.map((doc) => ({
    url: `${base}/artist/${String(doc._id)}`,
    lastModified: (doc as any).updatedAt || (doc as any).createdAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticUrls, ...artworkUrls, ...artistUrls]
}
