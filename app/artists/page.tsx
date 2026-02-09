import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { listArtists } from '@/lib/db/users'
import { ArtistsGrid } from '@/components/artists-grid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Artists | Artify',
  description: 'Discover artists and explore their portfolios.',
}

export default async function ArtistsPage() {
  const pageSize = 12
  const { items, total } = await listArtists(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasMore = totalPages > 1

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Artists</h1>
      <div className="mb-4 text-sm text-muted-foreground">{total} artists</div>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold">No artists found</h2>
          <p className="text-sm text-muted-foreground mt-1">Please check back later.</p>
        </div>
      ) : (
        <ArtistsGrid
          initialArtists={items.map((artist) => ({
            _id: String(artist._id),
            name: artist.name,
            email: artist.email,
            bio: artist.bio,
            avatarUrl: artist.avatarUrl,
          }))}
          initialHasMore={hasMore}
        />
      )}
    </div>
  )
}
