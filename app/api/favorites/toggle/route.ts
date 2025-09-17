import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { toggleFavorite, countFavoritesForArtwork } from '@/lib/db/favorites'

export const dynamic = 'force-dynamic'

const ToggleSchema = z.object({
  artworkId: z.string().refine((v) => ObjectId.isValid(v), 'Invalid artworkId')
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = ToggleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  }

  const { artworkId } = parsed.data
  const favorited = await toggleFavorite(session.user.id, artworkId)
  const count = await countFavoritesForArtwork(artworkId)
  return NextResponse.json({ favorited, count })
}

