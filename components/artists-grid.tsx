'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { InfiniteScrollContainer } from '@/components/infinite-scroll-container'

type ArtistItem = {
  _id: string
  name: string
  email: string
  bio?: string
  avatarUrl?: string
}

type ArtistsGridProps = {
  initialArtists: ArtistItem[]
  initialHasMore: boolean
}

export function ArtistsGrid({ initialArtists, initialHasMore }: ArtistsGridProps) {
  const fetchMore = async (page: number) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '12',
    })

    const response = await fetch(`/api/artists/list?${params.toString()}`)
    if (!response.ok) throw new Error('Failed to fetch artists')

    const data = await response.json()
    return {
      items: data.items,
      hasMore: data.hasMore,
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'A'
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] ?? ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return (first + last).toUpperCase() || 'A'
  }

  const renderArtist = (artist: ArtistItem) => (
    <Card key={artist._id} className="overflow-hidden">
      <CardContent className="p-4 flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={artist.avatarUrl || ''} alt={artist.name} />
          <AvatarFallback>{getInitials(artist.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg leading-tight">{artist.name}</h3>
          <p className="text-xs text-muted-foreground">{artist.email}</p>
          {artist.bio ? <p className="text-sm mt-2 line-clamp-2">{artist.bio}</p> : null}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button asChild size="sm" variant="outline">
          <Link href={`/artist/${artist._id}`}>View profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <InfiniteScrollContainer
      initialData={initialArtists}
      initialPage={1}
      hasMore={initialHasMore}
      fetchMore={fetchMore}
      renderItem={renderArtist}
      getItemKey={(artist) => artist._id}
      gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      loadingMessage="Loading more artists..."
      endMessage="You've reached the end"
    />
  )
}
