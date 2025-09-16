"use client"

import { useState, useTransition, useCallback, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

type Props = {
  artworkId: string
  initialFavorited?: boolean
  initialCount?: number
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline' | 'ghost'
  showCount?: boolean
}

export function FavoriteButton({
  artworkId,
  initialFavorited,
  initialCount,
  size = 'sm',
  variant = 'outline',
  showCount = false,
}: Props) {
  const router = useRouter()
  const [favorited, setFavorited] = useState<boolean | undefined>(initialFavorited)
  const [count, setCount] = useState<number | undefined>(initialCount)
  const [isPending, startTransition] = useTransition()

  // Optional: if neither state is provided, stay lazy (no auto-fetch) to avoid N+1 on grids.
  // You can enable fetch-on-mount by uncommenting below.
  // useEffect(() => {
  //   if (favorited == null || count == null) {
  //     fetch(`/api/favorites/status?artworkId=${artworkId}`)
  //       .then((r) => r.ok ? r.json() : null)
  //       .then((d) => { if (d) { setFavorited(!!d.favorited); setCount(d.count) } })
  //       .catch(() => {})
  //   }
  // }, [artworkId])

  const onToggle = useCallback(() => {
    if (isPending) return
    startTransition(async () => {
      // Optimistic update when we know current state
      const prevFav = favorited === true
      const prevCount = count ?? 0
      if (favorited != null) {
        setFavorited(!prevFav)
        setCount(Math.max(0, prevCount + (prevFav ? -1 : 1)))
      }

      try {
        const res = await fetch('/api/favorites/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artworkId }),
        })
        if (res.status === 401) {
          // Not logged in → route to login and preserve return
          const cb = encodeURIComponent(window.location.pathname + window.location.search)
          router.push(`/login?callbackUrl=${cb}`)
          return
        }
        if (!res.ok) throw new Error('Failed to toggle favorite')
        const data = await res.json()
        setFavorited(!!data.favorited)
        setCount(typeof data.count === 'number' ? data.count : undefined)
      } catch (e) {
        // Revert optimistic change on error
        if (favorited != null) {
          setFavorited(prevFav)
          setCount(prevCount)
        }
        toast({ title: 'Something went wrong', description: 'Could not update favorite.', variant: 'destructive' })
      }
    })
  }, [artworkId, favorited, count, isPending, router])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onToggle}
      disabled={isPending}
      aria-pressed={favorited ? true : false}
      className="hover:text-red-500"
   >
      <Heart className={`h-4 w-4 mr-2 ${favorited ? 'fill-current text-red-500' : ''}`} />
      {showCount && typeof count === 'number' ? `Favorite (${count})` : 'Favorite'}
    </Button>
  )
}
