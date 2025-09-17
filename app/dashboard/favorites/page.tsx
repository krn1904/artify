import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { listFavoritesByUser } from '@/lib/db/favorites'
import { getArtworksCollection } from '@/lib/db/artworks'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from '@/components/favorite-button'
import { ArtworkQuickView } from '@/components/artwork-quick-view'
import RouteRefresher from '@/components/shared/route-refresher'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Favorites | Artify',
  description: 'Browse the artworks you have favorited.',
}

type SearchParams = { page?: string; pageSize?: string }

function parseIntOr<T extends number>(value: string | undefined, fallback: T, min?: number, max?: number): number {
  const n = value ? Number.parseInt(value, 10) : NaN
  if (Number.isNaN(n)) return fallback
  let v = n
  if (min != null) v = Math.max(min, v)
  if (max != null) v = Math.min(max, v)
  return v
}

export default async function FavoritesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?reason=auth&callbackUrl=%2Fdashboard%2Ffavorites')

  const page = parseIntOr(searchParams.page, 1, 1)
  const pageSize = parseIntOr(searchParams.pageSize, 12, 1, 100)

  const { items, total } = await listFavoritesByUser(session.user.id, page, pageSize)
  const ids = items.map((f) => f.artworkId)
  const col = await getArtworksCollection()
  const artworks = await col.find({ _id: { $in: ids } }).toArray()
  const map = new Map(artworks.map((a) => [String(a._id), a]))
  const rows = items
    .map((f) => ({ favoriteId: String(f._id), createdAt: f.createdAt, art: map.get(String(f.artworkId)) }))
    .filter((r) => !!r.art) as Array<{ favoriteId: string; createdAt: Date; art: any }>

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const makeHref = (overrides: Partial<SearchParams> = {}) => {
    const sp = new URLSearchParams()
    const next = { page, pageSize, ...overrides }
    if (next.page && next.page !== 1) sp.set('page', String(next.page))
    if (next.pageSize && next.pageSize !== 12) sp.set('pageSize', String(next.pageSize))
    const qs = sp.toString()
    return qs ? `/dashboard/favorites?${qs}` : '/dashboard/favorites'
  }

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
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            {rows.map(({ art }) => (
              <Card key={String(art._id)} className="overflow-hidden">
                <ArtworkQuickView
                  id={String(art._id)}
                  title={art.title}
                  imageUrl={art.imageUrl}
                  price={art.price}
                  description={art.description}
                  tags={art.tags}
                  artistId={String(art.artistId)}
                  trigger={
                    <div className="aspect-square relative cursor-pointer">
                      <Image
                        src={art.imageUrl}
                        alt={art.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        priority={false}
                      />
                    </div>
                  }
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">
                    <ArtworkQuickView
                      id={String(art._id)}
                      title={art.title}
                      imageUrl={art.imageUrl}
                      price={art.price}
                      description={art.description}
                      tags={art.tags}
                      artistId={String(art.artistId)}
                      trigger={<span className="cursor-pointer underline-offset-4 hover:underline">{art.title}</span>}
                    />
                  </h3>
                  <p className="font-bold mt-2">${art.price}</p>
                  {art.tags?.length ? (
                    <p className="text-xs text-muted-foreground mt-1">{art.tags.join(', ')}</p>
                  ) : null}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <FavoriteButton artworkId={String(art._id)} size="sm" initialFavorited={true} />
                  <div>
                    <Button asChild size="sm" variant="outline"><Link href={`/artwork/${String(art._id)}`}>View</Link></Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            <Button asChild variant="outline" disabled={page <= 1}>
              <Link href={makeHref({ page: String(Math.max(1, page - 1)) })}>Previous</Link>
            </Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <Button asChild variant="outline" disabled={page >= totalPages}>
              <Link href={makeHref({ page: String(Math.min(totalPages, page + 1)) })}>Next</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
