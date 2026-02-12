import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { toggleFavorite, countFavoritesForArtwork } from '@/lib/db/favorites'
import { FavoriteToggleSchema } from '@/lib/schemas/favorite'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = FavoriteToggleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  }

  const { artworkId } = parsed.data
  const favorited = await toggleFavorite(session.user.id, artworkId)
  const count = await countFavoritesForArtwork(artworkId)
  return NextResponse.json({ favorited, count })
}

