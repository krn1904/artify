import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Share2, SearchX } from 'lucide-react'
import { listArtworks } from '@/lib/db/artworks'
import { ArtworkQuickView } from '@/components/artwork-quick-view'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Explore Artwork | Artify',
  description: 'Browse curated artworks across paintings, digital art, photography, and sculpture.',
}

type SearchParams = {
  page?: string
  pageSize?: string
  tags?: string | string[]
}

function parseIntOr<T extends number>(value: string | undefined, fallback: T, min?: number, max?: number): number {
  const n = value ? Number.parseInt(value, 10) : NaN
  if (Number.isNaN(n)) return fallback
  let v = n
  if (min != null) v = Math.max(min, v)
  if (max != null) v = Math.min(max, v)
  return v
}

// no-op helper removed (filters deferred)

// Public Explore page: lists artworks with optional tag filter and pagination.
export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const page = parseIntOr(searchParams.page, 1, 1)
  const pageSize = parseIntOr(searchParams.pageSize, 12, 1, 100)
  const activeTag = typeof searchParams.tags === 'string' ? searchParams.tags : undefined

  const { items, total } = await listArtworks(
    { tags: activeTag ? [activeTag] : undefined },
    { page, pageSize }
  )

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const makeHref = (overrides: Partial<SearchParams> = {}) => {
    const sp = new URLSearchParams()
    const next = { page, pageSize, tags: activeTag, ...overrides }
    if (next.page && next.page !== 1) sp.set('page', String(next.page))
    if (next.pageSize && next.pageSize !== 12) sp.set('pageSize', String(next.pageSize))
    if (next.tags) sp.set('tags', String(next.tags))
    const qs = sp.toString()
    return qs ? `/explore?${qs}` : '/explore'
  }

  return (
    <div className="container mx-auto py-8 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Explore Artwork</h1>

      {/* Category Chips (single-select) */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { label: 'All Artwork', value: undefined },
          { label: 'Paintings', value: 'painting' },
          { label: 'Digital Art', value: 'digital' },
          { label: 'Photography', value: 'photography' },
          { label: 'Sculptures', value: 'sculpture' },
        ].map(({ label, value }) => {
          const href = value ? makeHref({ tags: value, page: '1' }) : '/explore'
          const isActive = (!activeTag && value === undefined) || activeTag === value
          return (
            <Button key={label} asChild variant={isActive ? 'default' : 'outline'} size="sm">
              <Link href={href}>{label}</Link>
            </Button>
          )
        })}
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
              <Link href="/explore">Show all artwork</Link>
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
                  <Link href={makeHref({ tags: value, page: '1' })}>{label}</Link>
                </Button>
              ))}
            <Button asChild variant="outline">
              <Link href="/artists">Browse artists</Link>
            </Button>
          </div>
          </div>
        ) : (
          <>
          {/* Artwork Grid */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            {items.map((art) => (
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
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorite
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          </>
        )}
      </div>

      {/* Pagination at bottom */}
      {total > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button asChild variant="outline" disabled={page <= 1}>
            <Link href={makeHref({ page: String(Math.max(1, page - 1)) })}>Previous</Link>
          </Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button asChild variant="outline" disabled={page >= totalPages}>
            <Link href={makeHref({ page: String(Math.min(totalPages, page + 1)) })}>Next</Link>
          </Button>
        </div>
      )}
    </div>
  )
}