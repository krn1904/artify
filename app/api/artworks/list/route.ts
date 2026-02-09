import { NextRequest, NextResponse } from 'next/server'
import { listArtworks } from '@/lib/db/artworks'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getFavoritesCollection } from '@/lib/db/favorites'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10)
    const tags = searchParams.get('tags')
    const my = searchParams.get('my')

    console.log(`⏱️  API Route started`)

    const session = await getServerSession(authOptions)
    const myOnly = my === '1' && session?.user?.role === 'ARTIST'
    console.log(`⏱️  Session check: ${Date.now() - startTime}ms`)

    const dbStart = Date.now()
    const { items, total } = await listArtworks(
      {
        tags: tags ? [tags] : undefined,
        artistId: myOnly ? session!.user.id : undefined,
      },
      { page, pageSize }
    )
    console.log(`⏱️  DB query: ${Date.now() - dbStart}ms`)

    const totalPages = Math.ceil(total / pageSize)
    const hasMore = page < totalPages

    // Check favorites for logged-in user
    let favoritedSet = new Set<string>()
    if (session?.user?.id && items.length > 0) {
      const favStart = Date.now()
      try {
        const favCol = await getFavoritesCollection()
        const ids = items.map((a) => a._id).filter(Boolean) as ObjectId[]
        const favs = await favCol
          .find({ userId: new ObjectId(session.user.id), artworkId: { $in: ids } }, { projection: { artworkId: 1 } })
          .toArray()
        favoritedSet = new Set(favs.map((f: any) => String(f.artworkId)))
        console.log(`⏱️  Favorites query: ${Date.now() - favStart}ms`)
      } catch {}
    }

    // Return simplified data for client with favorite status
    const simplifiedItems = items.map((art) => ({
      _id: String(art._id),
      title: art.title,
      imageUrl: art.imageUrl,
      price: art.price,
      description: art.description,
      tags: art.tags,
      artistId: String(art.artistId),
      initialFavorited: favoritedSet.has(String(art._id)),
    }))

    console.log(`⏱️  Total API Route: ${Date.now() - startTime}ms`)

    return NextResponse.json({
      items: simplifiedItems,
      hasMore,
      page,
      total,
    })
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 })
  }
}
