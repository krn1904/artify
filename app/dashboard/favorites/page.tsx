import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { redirect } from 'next/navigation'
import { listFavoritesByUser } from '@/lib/db/favorites'
import { getArtworksByIds } from '@/lib/db/artworks'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
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

export default async function FavoritesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?reason=auth&callbackUrl=%2Fdashboard%2Ffavorites')

  const params = await searchParams
  const page = parseIntOr(params.page, 1, 1)
  const pageSize = parseIntOr(params.pageSize, 12, 1, 100)

  const { items, total } = await listFavoritesByUser(session.user.id, page, pageSize)
  const artworks = await getArtworksByIds(items.map((f) => f.artworkId))

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
    <div className="container mx-auto py-8 max-w-5xl">
      <RouteRefresher intervalMs={0} onMount onFocus onInterval={false} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Favorites</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {total === 1 ? 'piece' : 'pieces'} saved
          </p>
        </div>
      </div>

      {artworks.length === 0 ? (
        <div className="border border-dashed rounded-xl min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center text-center gap-3 p-8">
            <div className="rounded-full bg-muted w-14 h-14 flex items-center justify-center">
              <Heart className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">No artworks saved yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Heart artworks while browsing and they&apos;ll appear here.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link href="/explore">Browse artwork</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
            {artworks.map((art) => (
              <Card key={String(art._id)} className="overflow-hidden group">
                <ArtworkQuickView
                  id={String(art._id)}
                  title={art.title}
                  imageUrl={art.imageUrl}
                  price={art.price}
                  description={art.description}
                  tags={art.tags}
                  artistId={String(art.artistId)}
                  trigger={
                    <div className="aspect-square relative cursor-pointer overflow-hidden">
                      <Image
                        src={art.imageUrl}
                        alt={art.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={false}
                      />
                    </div>
                  }
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">
                    <ArtworkQuickView
                      id={String(art._id)}
                      title={art.title}
                      imageUrl={art.imageUrl}
                      price={art.price}
                      description={art.description}
                      tags={art.tags}
                      artistId={String(art.artistId)}
                      trigger={<span className="cursor-pointer hover:underline underline-offset-4">{art.title}</span>}
                    />
                  </h3>
                  <p className="font-bold text-sm mt-1">${art.price}</p>
                  {art.tags?.length ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {art.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <FavoriteButton artworkId={String(art._id)} size="sm" initialFavorited={true} />
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/artwork/${String(art._id)}`}>View</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button asChild variant="outline" disabled={page <= 1}>
                <Link href={makeHref({ page: String(Math.max(1, page - 1)) })}>Previous</Link>
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button asChild variant="outline" disabled={page >= totalPages}>
                <Link href={makeHref({ page: String(Math.min(totalPages, page + 1)) })}>Next</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
