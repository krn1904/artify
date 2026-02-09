import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { listFavoritesByUser } from '@/lib/db/favorites'
import { getArtworksCollection } from '@/lib/db/artworks'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10)

    const { items, total } = await listFavoritesByUser(session.user.id, page, pageSize)
    const ids = items.map((f) => f.artworkId)
    const col = await getArtworksCollection()
    const artworks = await col.find({ _id: { $in: ids } }).toArray()
    const map = new Map(artworks.map((a) => [String(a._id), a]))
    
    const rows = items
      .map((f) => {
        const art = map.get(String(f.artworkId))
        return art ? {
          _id: String(art._id),
          title: art.title,
          imageUrl: art.imageUrl,
          price: art.price,
          description: art.description,
          tags: art.tags,
          artistId: String(art.artistId),
        } : null
      })
      .filter((r) => r !== null)

    const totalPages = Math.ceil(total / pageSize)
    const hasMore = page < totalPages

    console.log(`⏱️  Favorites API Route: ${Date.now() - startTime}ms`)

    return NextResponse.json({
      items: rows,
      hasMore,
      page,
      total,
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}
