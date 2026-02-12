import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getUserById } from '@/lib/db/users'
import { listArtworks } from '@/lib/db/artworks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, SearchX } from 'lucide-react'
import { ArtworkQuickView } from '@/components/artwork-quick-view'
import { CloseBack } from '@/components/close-back'
import { FavoriteButton } from '@/components/favorite-button'
import { getFavoritesCollection } from '@/lib/db/favorites'
import { ObjectId } from 'mongodb'
import MyArtworkDelete from '@/components/my-artwork-delete'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artist = await getUserById(id)
  if (!artist) return { title: 'Artist Not Found | Artify' }
  return {
    title: `${artist.name} | Artify`,
    description: artist.bio || 'View artist profile and portfolio on Artify.',
  }
}

interface PageProps { params: Promise<{ id: string }> }

function getInitials(name?: string) {
  if (!name) return 'A'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || 'A'
}

// Artist Profile page: shows bio and a portfolio grid of artworks by artistId.
export default async function ArtistProfilePage({ params }: PageProps) {
  const { id } = await params
  const [session, artist] = await Promise.all([
    getServerSession(authOptions),
    getUserById(id),
  ])
  if (!artist) return notFound()
  const isSelf = session?.user?.id === id

  const { items: artworks, total } = await listArtworks({ artistId: id }, { page: 1, pageSize: 24 })

  // SSR-hydrate favorited state for the logged-in user
  let favoritedSet = new Set<string>()
  if (session?.user?.id && artworks.length > 0) {
    try {
      const favCol = await getFavoritesCollection()
      const ids = artworks.map((a) => a._id).filter(Boolean) as ObjectId[]
      const favs = await favCol
        .find({ userId: new ObjectId(session.user.id), artworkId: { $in: ids } }, { projection: { artworkId: 1 } })
        .toArray()
      favoritedSet = new Set(favs.map((f: any) => String(f.artworkId)))
    } catch {}
  }

  return (
    <div className="container mx-auto py-8 relative">
      {/* Back/Close button */}
      <div className="absolute right-4 top-4 z-10">
        <CloseBack label="Close profile" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={artist.avatarUrl || ''} alt={artist.name} />
          <AvatarFallback>{getInitials(artist.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          <p className="text-sm text-muted-foreground">{artist.email}</p>
          {artist.bio ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed whitespace-pre-line">{artist.bio}</p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">This artist hasn&apos;t added a bio yet.</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {isSelf ? (
              <>
                <Button asChild>
                  <Link href="/dashboard/profile">Edit profile</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/artworks/new">Add artwork</Link>
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href={`/commissions/new?artistId=${String(artist._id)}`}>Request commission</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/explore">Browse more artwork</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Portfolio</h2>
        <div className="text-sm text-muted-foreground">{total} {total === 1 ? 'item' : 'items'}</div>
      </div>

      {artworks.length === 0 ? (
        <div className="mt-12 min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-full bg-muted w-16 h-16 flex items-center justify-center">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No artworks yet</h3>
              <p className="text-sm text-muted-foreground mt-1">This artist hasn&apos;t added any artworks to their portfolio.</p>
            </div>
          </div>
        </div>
      ) : (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
          {artworks.map((art) => (
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
                <FavoriteButton artworkId={String(art._id)} size="sm" initialFavorited={favoritedSet.has(String(art._id))} />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {isSelf ? <MyArtworkDelete id={String(art._id)} /> : null}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
