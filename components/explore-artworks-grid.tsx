'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { ArtworkQuickView } from '@/components/artwork-quick-view'
import { FavoriteButton } from '@/components/favorite-button'
import { InfiniteScrollContainer } from '@/components/infinite-scroll-container'

type ArtworkItem = {
  _id: string
  title: string
  imageUrl: string
  price: number
  description?: string
  tags?: string[]
  artistId: string
  initialFavorited?: boolean
}

type ExploreArtworksGridProps = {
  initialArtworks: ArtworkItem[]
  initialHasMore: boolean
  tags?: string
  myOnly?: boolean
}

export function ExploreArtworksGrid({
  initialArtworks,
  initialHasMore,
  tags,
  myOnly,
}: ExploreArtworksGridProps) {
  const fetchMore = async (page: number) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '12',
    })
    if (tags) params.set('tags', tags)
    if (myOnly) params.set('my', '1')

    const response = await fetch(`/api/artworks/list?${params.toString()}`)
    if (!response.ok) throw new Error('Failed to fetch artworks')

    const data = await response.json()
    return {
      items: data.items,
      hasMore: data.hasMore,
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
        <FavoriteButton
          artworkId={art._id}
          size="sm"
          initialFavorited={art.initialFavorited || false}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <InfiniteScrollContainer
      key={`${tags || 'all'}-${myOnly ? 'my' : 'all'}`}
      initialData={initialArtworks}
      initialPage={1}
      hasMore={initialHasMore}
      fetchMore={fetchMore}
      renderItem={renderArtwork}
      getItemKey={(art) => art._id}
      gridClassName="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6"
      loadingMessage="Loading more artworks..."
      endMessage="You've reached the end"
    />
  )
}
