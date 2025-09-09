// Client-side Quick View dialog for artwork cards.
// Opens a modal that fetches full details on demand and displays them.
'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// Props accepted from the artwork card. Minimal info is used for a fast-open preview;
// the dialog fetches complete details once opened.
type Props = {
  id: string
  title: string
  imageUrl: string
  price: number
  description?: string
  tags?: string[]
  artistId?: string
  // Optional custom trigger element (e.g., wrapping image/title). Defaults to a button.
  trigger?: React.ReactNode
}

// Shape returned by /api/artworks/[id]
type ArtworkDetailResponse = {
  artwork: {
    _id: string
    title: string
    description: string
    price: number
    imageUrl: string
    tags: string[]
    artistId: string
  }
  artist: { _id: string; name: string; avatarUrl: string } | null
}

export function ArtworkQuickView({ id, title, imageUrl, price, description, tags, artistId, trigger }: Props) {
  // Controlled dialog open + load full data on demand
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<ArtworkDetailResponse | null>(null)
  const { data: session } = useSession()

  const display = {
    title: data?.artwork.title ?? title,
    imageUrl: data?.artwork.imageUrl ?? imageUrl,
    price: data?.artwork.price ?? price,
    description: data?.artwork.description ?? description ?? '',
    tags: data?.artwork.tags ?? tags ?? [],
    artistId: data?.artwork.artistId ?? artistId,
    artist: data?.artist ?? null,
  }
  const isSelf = session?.user?.id && display.artistId ? session.user.id === display.artistId : false

  // Fallback initials for avatar when no image is available.
  const getInitials = (name?: string) => {
    if (!name) return 'A'
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] ?? ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return (first + last).toUpperCase() || 'A'
  }

  // Lazy-load full details when dialog opens. Keeps initial card render light.
  React.useEffect(() => {
    if (!open) return
    let ignore = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
    const res = await fetch(`/api/artworks/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load artwork')
    const json: ArtworkDetailResponse = await res.json()
        if (!ignore) setData(json)
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [open, id])
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (<Button variant="outline" size="sm">Quick view</Button>)}
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">{display.title}</DialogTitle>
            {display.tags?.length ? (
              <DialogDescription>{display.tags.join(', ')}</DialogDescription>
            ) : null}
          </DialogHeader>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 px-6 pb-2">
          <div className="relative aspect-square w-full">
            {loading ? (
              <Skeleton className="h-full w-full absolute inset-0" />
            ) : (
              <Image
                src={display.imageUrl}
                alt={display.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-md"
              />
            )}
          </div>
          <div className="md:pl-2 py-4">
            <div className="flex items-center gap-3">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-semibold">${display.price}</div>
              )}
            </div>
            {display.artistId ? (
              <div className="flex items-center gap-3 mt-3">
                <Avatar className="h-8 w-8">
                  {loading ? (
                    <Skeleton className="h-8 w-8 rounded-full" />
                  ) : (
                    <>
                      <AvatarImage src={display.artist?.avatarUrl || ''} alt={display.artist?.name || ''} />
                      <AvatarFallback>{getInitials(display.artist?.name)}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                {loading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <Link href={`/artist/${display.artistId}`} className="text-sm underline">
                    {display.artist?.name ? `by ${display.artist.name}` : 'View artist profile'}
                  </Link>
                )}
              </div>
            ) : null}
            {error ? (
              <p className="text-sm text-destructive mt-3">{error}</p>
            ) : display.description ? (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed whitespace-pre-line">{display.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-3">{loading ? 'Loading…' : 'No description provided.'}</p>
            )}
          </div>
        </div>
        <div className="px-6 pb-6">
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <Button asChild variant="outline">
              <Link href={`/artwork/${id}`}>Open full details</Link>
            </Button>
            {display.artistId ? (
              isSelf ? (
                <Button disabled title="You can’t request a commission from your own profile">Request commission</Button>
              ) : (
                <Button asChild>
                  <Link href={`/artist/${display.artistId}`}>Request commission</Link>
                </Button>
              )
            ) : null}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
