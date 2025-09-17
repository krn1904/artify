import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { ObjectId } from 'mongodb'
import { isFavorited, countFavoritesForArtwork } from '@/lib/db/favorites'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(req.url)
  const artworkId = searchParams.get('artworkId') || ''
  if (!ObjectId.isValid(artworkId)) {
    return NextResponse.json({ error: 'Invalid artworkId' }, { status: 400 })
  }
  const count = await countFavoritesForArtwork(artworkId)
  const favorited = session?.user?.id ? await isFavorited(session.user.id, artworkId) : false
  return NextResponse.json({ favorited, count })
}

