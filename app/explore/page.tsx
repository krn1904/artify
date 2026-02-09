import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'
import { listArtworks } from '@/lib/db/artworks'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getFavoritesCollection } from '@/lib/db/favorites'
import { ObjectId } from 'mongodb'
import { ExploreArtworksGrid } from '@/components/explore-artworks-grid'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Explore Artwork | Artify',
  description: 'Browse curated artworks across paintings, digital art, photography, and sculpture.',
}

type SearchParams = {
  tags?: string | string[]
  my?: string
}

// Public Explore page: lists artworks with optional tag filter and infinite scroll.
export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions)
  const pageSize = 12
  const activeTag = typeof searchParams.tags === 'string' ? searchParams.tags : undefined
  const myOnly = searchParams.my === '1' && session?.user?.role === 'ARTIST'

  const { items, total } = await listArtworks(
    { tags: activeTag ? [activeTag] : undefined, artistId: myOnly ? session!.user.id : undefined },
    { page: 1, pageSize }
  )

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasMore = totalPages > 1

  // SSR-hydrate which artworks are favorited by the current user (single query)
  let favoritedSet = new Set<string>()
  if (session?.user?.id && items.length > 0) {
    try {
      const favCol = await getFavoritesCollection()
      const ids = items.map((a) => a._id).filter(Boolean) as ObjectId[]
      const favs = await favCol
        .find({ userId: new ObjectId(session.user.id), artworkId: { $in: ids } }, { projection: { artworkId: 1 } })
        .toArray()
      favoritedSet = new Set(favs.map((f: any) => String(f.artworkId)))
    } catch {}
  }

  const makeHref = (overrides: Partial<SearchParams> = {}) => {
    const sp = new URLSearchParams()
    const next = { tags: activeTag, my: myOnly ? '1' : undefined, ...overrides }
    if (next.tags) sp.set('tags', String(next.tags))
    if (next.my === '1') sp.set('my', '1')
    const qs = sp.toString()
    return qs ? `/explore?${qs}` : '/explore'
  }

  return (
    <div className="container mx-auto py-8 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Explore Artwork</h1>
        {session?.user?.role === 'ARTIST' ? (
          <Button asChild>
            <Link href="/dashboard/artworks/new">Add artwork</Link>
          </Button>
        ) : null}
      </div>

      {/* Category Chips (single-select) */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { label: 'All Artwork', value: undefined },
          { label: 'Paintings', value: 'painting' },
          { label: 'Digital Art', value: 'digital' },
          { label: 'Photography', value: 'photography' },
          { label: 'Sculptures', value: 'sculpture' },
        ].map(({ label, value }) => {
          const href = value ? makeHref({ tags: value }) : makeHref({ tags: undefined })
          const isActive = (!activeTag && value === undefined) || activeTag === value
          return (
            <Button key={label} asChild variant={isActive ? 'default' : 'outline'} size="sm">
              <Link href={href}>{label}</Link>
            </Button>
          )
        })}
        {session?.user?.role === 'ARTIST' ? (
          <Button
            asChild
            size="sm"
            variant={myOnly ? 'default' : 'outline'}
          >
            <Link href={myOnly ? makeHref({ my: undefined }) : makeHref({ my: '1' })}>
              My Artworks
            </Link>
          </Button>
        ) : null}
        <div className="ml-auto text-sm text-muted-foreground">{total} results</div>
      </div>

      <div className="flex-1">
        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center gap-4">
          <div className="rounded-full bg-muted w-16 h-16 flex items-center justify-center">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">No artworks found</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTag ? (
                <>We couldn’t find any items for “{activeTag}”. Try another category or clear the filter.</>
              ) : (
                <>There’s nothing to show right now. Try browsing all artwork or check back later.</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <Link href={makeHref({ tags: undefined })}>Show all artwork</Link>
            </Button>
            {[
              { label: 'Paintings', value: 'painting' },
              { label: 'Digital Art', value: 'digital' },
              { label: 'Photography', value: 'photography' },
              { label: 'Sculptures', value: 'sculpture' },
            ]
              .filter((o) => o.value !== activeTag)
              .map(({ label, value }) => (
                <Button key={value} asChild variant="outline">
                  <Link href={makeHref({ tags: value })}>{label}</Link>
                </Button>
              ))}
            <Button asChild variant="outline">
              <Link href="/artists">Browse artists</Link>
            </Button>
          </div>
          </div>
        ) : (
          <ExploreArtworksGrid
            initialArtworks={items.map((art) => ({
              _id: String(art._id),
              title: art.title,
              imageUrl: art.imageUrl,
              price: art.price,
              description: art.description,
              tags: art.tags,
              artistId: String(art.artistId),
              initialFavorited: favoritedSet.has(String(art._id)),
            }))}
            initialHasMore={hasMore}
            tags={activeTag}
            myOnly={myOnly}
          />
        )}
      </div>
    </div>
  )
}
