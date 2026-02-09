import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { listFavoritesByUser } from '@/lib/db/favorites'
import { getArtworksCollection } from '@/lib/db/artworks'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RouteRefresher from '@/components/shared/route-refresher'
import { FavoritesGrid } from '@/components/favorites-grid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Favorites | Artify',
  description: 'Browse the artworks you have favorited.',
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?reason=auth&callbackUrl=%2Fdashboard%2Ffavorites')

  const pageSize = 12
  const { items, total } = await listFavoritesByUser(session.user.id, 1, pageSize)
  const ids = items.map((f) => f.artworkId)
  const col = await getArtworksCollection()
  const artworks = await col.find({ _id: { $in: ids } }).toArray()
  const map = new Map(artworks.map((a) => [String(a._id), a]))
  const rows = items
    .map((f) => ({ favoriteId: String(f._id), createdAt: f.createdAt, art: map.get(String(f.artworkId)) }))
    .filter((r) => !!r.art) as Array<{ favoriteId: string; createdAt: Date; art: any }>

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasMore = totalPages > 1

  return (
    <div className="container mx-auto py-8">
      <RouteRefresher intervalMs={0} onMount onFocus onInterval={false} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <div className="text-sm text-muted-foreground">{total} {total === 1 ? 'item' : 'items'}</div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold">No favorites yet</h2>
          <p className="text-sm text-muted-foreground mt-1">Tap the heart icon on any artwork to add it here.</p>
          <div className="mt-4">
            <Button asChild variant="outline"><Link href="/explore">Browse artwork</Link></Button>
          </div>
        </div>
      ) : (
        <FavoritesGrid
          initialArtworks={rows.map(({ art }) => ({
            _id: String(art._id),
            title: art.title,
            imageUrl: art.imageUrl,
            price: art.price,
            description: art.description,
            tags: art.tags,
            artistId: String(art.artistId),
          }))}
          initialHasMore={hasMore}
        />
      )}
    </div>
  )
}
