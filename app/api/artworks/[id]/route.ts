import { NextResponse } from 'next/server'
import { getArtworkById } from '@/lib/db/artworks'
import { getUserById } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const art = await getArtworkById(params.id)
    if (!art) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const artist = await getUserById(art.artistId)
    return NextResponse.json({
      artwork: {
        _id: String(art._id),
        title: art.title,
        description: art.description ?? '',
        price: art.price,
        imageUrl: art.imageUrl,
        tags: art.tags ?? [],
        artistId: String(art.artistId),
      },
      artist: artist
        ? { _id: String(artist._id), name: artist.name, avatarUrl: artist.avatarUrl ?? '' }
        : null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
