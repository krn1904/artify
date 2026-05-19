import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { getUserById } from '@/lib/db/users'
import { listArtworks } from '@/lib/db/artworks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, SearchX, Palette, ShoppingBag, ImageIcon } from 'lucide-react'
import { ArtworkQuickView } from '@/components/artwork-quick-view'
import { FavoriteButton } from '@/components/favorite-button'
import { getFavoritesCollection } from '@/lib/db/favorites'
import { ObjectId } from 'mongodb'
import MyArtworkDelete from '@/components/my-artwork-delete'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  const openToCommissions = (artist as any).openToCommissions ?? true

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

  const isArtist = artist.role === 'ARTIST'

  return (
    <div className="min-h-screen">

      {/* ── Profile hero card ─────────────────────────────── */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">

            {/* Avatar */}
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-md shrink-0">
              <AvatarImage src={artist.avatarUrl || ''} alt={artist.name} />
              <AvatarFallback className="text-2xl">{getInitials(artist.name)}</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{artist.name}</h1>
                {isArtist ? (
                  <Badge variant={openToCommissions ? 'default' : 'secondary'}>
                    {openToCommissions ? 'Open to commissions' : 'Not accepting commissions'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <ShoppingBag className="h-3 w-3" />
                    Art Collector
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">{artist.email}</p>

              {artist.bio ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-2xl whitespace-pre-line">
                  {artist.bio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground italic">
                  {isSelf ? 'Add a bio from your profile settings.' : 'No bio yet.'}
                </p>
              )}

              {/* Stats row — artists only */}
              {isArtist && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span><strong className="text-foreground">{total}</strong> {total === 1 ? 'artwork' : 'artworks'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    <span>Artist</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 flex flex-wrap gap-2">
                {isSelf ? (
                  <>
                    <Button asChild size="sm">
                      <Link href="/dashboard/profile">Edit profile</Link>
                    </Button>
                    {session?.user?.role === 'ARTIST' && (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/artworks/new">Add artwork</Link>
                      </Button>
                    )}
                  </>
                ) : isArtist && openToCommissions ? (
                  <>
                    <Button asChild size="sm">
                      <Link href={`/requests/new?artistId=${String(artist._id)}`}>Request commission</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/explore">Browse artwork</Link>
                    </Button>
                  </>
                ) : isArtist ? (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <Button size="sm" disabled>Request commission</Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This artist is not accepting new commissions right now.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/explore">Browse artwork</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/explore">Browse artwork</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Portfolio (artists only) ───────────────────────── */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isArtist ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Portfolio</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{total} {total === 1 ? 'piece' : 'pieces'} of work</p>
              </div>
              {isSelf && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/artworks/new">Add artwork</Link>
                </Button>
              )}
            </div>

            {artworks.length === 0 ? (
              <div className="border border-dashed rounded-xl min-h-[40vh] flex items-center justify-center">
                <div className="flex flex-col items-center text-center gap-3 p-8">
                  <div className="rounded-full bg-muted w-14 h-14 flex items-center justify-center">
                    <SearchX className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">No artworks yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isSelf ? 'Start building your portfolio by adding your first artwork.' : 'This artist hasn\'t added any artworks yet.'}
                    </p>
                  </div>
                  {isSelf && (
                    <Button asChild size="sm" className="mt-2">
                      <Link href="/dashboard/artworks/new">Add your first artwork</Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
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
                      <FavoriteButton artworkId={String(art._id)} size="sm" initialFavorited={favoritedSet.has(String(art._id))} />
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        {isSelf ? <MyArtworkDelete id={String(art._id)} /> : null}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          /* ── Customer / Buyer view ── */
          <div className="border border-dashed rounded-xl min-h-[30vh] flex items-center justify-center">
            <div className="flex flex-col items-center text-center gap-3 p-8">
              <div className="rounded-full bg-muted w-14 h-14 flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Art Collector</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {isSelf
                    ? 'You\'re browsing as a collector. Explore artworks and send commission requests to artists.'
                    : `${artist.name} is an art collector on Artify.`}
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-2">
                <Link href="/explore">Explore artwork</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
