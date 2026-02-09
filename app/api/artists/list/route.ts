import { NextRequest, NextResponse } from 'next/server'
import { listArtists } from '@/lib/db/users'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10)

    const { items, total } = await listArtists(page, pageSize)

    const totalPages = Math.ceil(total / pageSize)
    const hasMore = page < totalPages

    // Return simplified data for client
    const simplifiedItems = items.map((artist) => ({
      _id: String(artist._id),
      name: artist.name,
      email: artist.email,
      bio: artist.bio,
      avatarUrl: artist.avatarUrl,
    }))

    console.log(`⏱️  Artists API Route: ${Date.now() - startTime}ms`)

    return NextResponse.json({
      items: simplifiedItems,
      hasMore,
      page,
      total,
    })
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
  }
}
