'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from '@/components/favorite-button'
import { ArtworkQuickView } from '@/components/artwork-quick-view'
import { InfiniteScrollContainer } from '@/components/infinite-scroll-container'
import { fetchFavoritesAction } from '@/lib/actions/fetch-lists'

type ArtworkItem = {
  _id: string
  title: string
  imageUrl: string
  price: number
  description?: string
  tags?: string[]
  artistId: string
}

type FavoritesGridProps = {
  initialArtworks: ArtworkItem[]
  initialHasMore: boolean
}

export function FavoritesGrid({ initialArtworks, initialHasMore }: FavoritesGridProps) {
  const fetchMore = async (page: number) => {
    const result = await fetchFavoritesAction(page, 12)
    return {
      items: result.items,
      hasMore: result.hasMore,
    }
  }

  const renderArtwork = (art: ArtworkItem) => (
    <Card key={art._id} className="overflow-hidden">
      <ArtworkQuickView
        id={art._id}
        title={art.title}
        imageUrl={art.imageUrl}
        price={art.price}
        description={art.description}
        tags={art.tags}
        artistId={art.artistId}
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
            id={art._id}
            title={art.title}
            imageUrl={art.imageUrl}
            price={art.price}
            description={art.description}
            tags={art.tags}
            artistId={art.artistId}
            trigger={<span className="cursor-pointer underline-offset-4 hover:underline">{art.title}</span>}
          />
        </h3>
        <p className="font-bold mt-2">${art.price}</p>
        {art.tags?.length ? (
          <p className="text-xs text-muted-foreground mt-1">{art.tags.join(', ')}</p>
        ) : null}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <FavoriteButton artworkId={art._id} size="sm" initialFavorited={true} />
        <div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/artwork/${art._id}`}>View</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <InfiniteScrollContainer
      initialData={initialArtworks}
      initialPage={1}
      hasMore={initialHasMore}
      fetchMore={fetchMore}
      renderItem={renderArtwork}
      getItemKey={(art) => art._id}
      gridClassName="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6"
      loadingMessage="Loading more favorites..."
      endMessage="You've reached the end"
    />
  )
}
