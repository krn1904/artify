'use server'

import { listArtworks } from '@/lib/db/artworks'
import { listArtists } from '@/lib/db/users'
import { listFavoritesByUser, getFavoritesCollection } from '@/lib/db/favorites'
import { getArtworksCollection } from '@/lib/db/artworks'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { ObjectId } from 'mongodb'

// Helper to log performance in development
const logTiming = (label: string, start: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️  ${label}: ${Date.now() - start}ms`)
  }
}

// Type definitions for return values
export type ArtworkItem = {
  _id: string
  title: string
  imageUrl: string
  price: number
  description?: string
  tags?: string[]
  artistId: string
  initialFavorited: boolean
}

export type ArtistItem = {
  _id: string
  name: string
  email: string
  bio?: string
  avatarUrl?: string
}

/**
 * Server Action: Fetch paginated artworks with optional filters
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 * @param tags - Optional tag filter
 * @param myOnly - Filter to only show current user's artworks (artists only)
 * @returns Paginated artwork items with favorite status
 */
export async function fetchArtworksAction(
  page: number,
  pageSize: number,
  tags?: string,
  myOnly?: boolean
) {
  const startTime = Date.now()
  
  // For guest users (no myOnly filter), skip session and favorites
  if (!myOnly) {
    const dbStart = Date.now()
    const { items, total } = await listArtworks(
      { tags: tags ? [tags] : undefined },
      { page, pageSize }
    )
    logTiming('DB query (guest)', dbStart)

    const totalPages = Math.ceil(total / pageSize)
    const hasMore = page < totalPages

    logTiming('Total fetchArtworksAction (guest)', startTime)
    return {
      items: items.map((art): ArtworkItem => ({
        _id: String(art._id),
        title: art.title,
        imageUrl: art.imageUrl,
        price: art.price,
        description: art.description,
        tags: art.tags,
        artistId: String(art.artistId),
        initialFavorited: false,
      })),
      hasMore,
      total,
    }
  }

  // For authenticated users: parallel session + DB query, then favorites
  const parallelStart = Date.now()
  const [session, artworksResult] = await Promise.all([
    getServerSession(authOptions),
    listArtworks(
      { tags: tags ? [tags] : undefined },
      { page, pageSize }
    ),
  ])
  logTiming('Session + DB (parallel)', parallelStart)

  const { items, total } = artworksResult
  const totalPages = Math.ceil(total / pageSize)
  const hasMore = page < totalPages

  // Fetch favorites only if logged in
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
      logTiming('Favorites query', favStart)
    } catch (err) {
      console.error('Favorites fetch failed:', err)
    }
  }

  logTiming('Total fetchArtworksAction (auth)', startTime)
  
  return {
    items: items.map((art): ArtworkItem => ({
      _id: String(art._id),
      title: art.title,
      imageUrl: art.imageUrl,
      price: art.price,
      description: art.description,
      tags: art.tags,
      artistId: String(art.artistId),
      initialFavorited: favoritedSet.has(String(art._id)),
    })),
    hasMore,
    total,
  }
}

/**
 * Server Action: Fetch paginated artists
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Paginated artist items
 */
export async function fetchArtistsAction(page: number, pageSize: number) {
  const { items, total } = await listArtists(page, pageSize)

  const totalPages = Math.ceil(total / pageSize)
  const hasMore = page < totalPages

  return {
    items: items.map((artist): ArtistItem => ({
      _id: String(artist._id),
      name: artist.name,
      email: artist.email,
      bio: artist.bio,
      avatarUrl: artist.avatarUrl,
    })),
    hasMore,
    total,
  }
}

/**
 * Server Action: Fetch user's favorited artworks
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Paginated favorite artwork items
 * @throws Error if user is not authenticated
 */
export async function fetchFavoritesAction(page: number, pageSize: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized: Must be logged in to view favorites')
  }

  const { items, total } = await listFavoritesByUser(session.user.id, page, pageSize)
  const ids = items.map((f) => f.artworkId)
  const col = await getArtworksCollection()
  const artworks = await col.find({ _id: { $in: ids } }).toArray()
  const map = new Map(artworks.map((a) => [String(a._id), a]))

  const rows = items
    .map((f) => {
      const art = map.get(String(f.artworkId))
      return art
        ? {
            _id: String(art._id),
            title: art.title,
            imageUrl: art.imageUrl,
            price: art.price,
            description: art.description,
            tags: art.tags,
            artistId: String(art.artistId),
            initialFavorited: true, // Always true for favorites
          }
        : null
    })
    .filter((r) => r !== null) as ArtworkItem[]

  const totalPages = Math.ceil(total / pageSize)
  const hasMore = page < totalPages

  return {
    items: rows,
    hasMore,
    total,
  }
}
