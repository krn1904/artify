import { Collection, ObjectId, Sort, Filter } from 'mongodb'
import getMongoClient from '@/lib/db'

/**
 * Artwork document shape stored in MongoDB.
 * Only fields and indexes; CRUD helpers will be committed separately.
 */
export interface ArtworkDoc {
  _id?: ObjectId
  title: string
  description?: string
  price: number
  imageUrl: string
  artistId: ObjectId
  tags: string[]
  createdAt: Date
  updatedAt?: Date
}

/** Get the artworks collection and ensure required indexes exist. */
export async function getArtworksCollection(): Promise<Collection<ArtworkDoc>> {
  const client = await getMongoClient()
  const db = client.db('artify')
  const col = db.collection<ArtworkDoc>('artworks')
  await ensureArtworksIndexes(col)
  return col
}

/**
 * Ensure indexes on the `artworks` collection used by Explore and profile pages.
 * Index intent:
 * - createdAt_desc: fast "newest first" listing
 * - price_asc: sort and range queries by price
 * - artistId_asc: fetch by artist for profile pages
 * - tags_asc: tag-based filtering
 * If a collection is passed in, reuse it; otherwise open one and create indexes.
 */
export async function ensureArtworksIndexes(col?: Collection<ArtworkDoc>) {
  // Two clear branches keep the collection reference defined at all times.
  // This avoids null assertions and makes the flow explicit.
  if (!col) {
    const client = await getMongoClient()
    const db = client.db('artify')
    const c = db.collection<ArtworkDoc>('artworks')
    await c.createIndexes([
      { key: { createdAt: -1 }, name: 'createdAt_desc' },
      { key: { price: 1 }, name: 'price_asc' },
      { key: { artistId: 1 }, name: 'artistId_asc' },
      { key: { tags: 1 }, name: 'tags_asc' },
    ])
    return
  }
  const c = col
  await c.createIndexes([
    { key: { createdAt: -1 }, name: 'createdAt_desc' },
    { key: { price: 1 }, name: 'price_asc' },
    { key: { artistId: 1 }, name: 'artistId_asc' },
    { key: { tags: 1 }, name: 'tags_asc' },
  ])
}

/** Sorting presets for exploration. */
export type ArtworkSort = 'new' | 'priceAsc' | 'priceDesc'

/** Optional filters when listing artworks. */
export interface ListArtworksFilters {
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  artistId?: string | ObjectId
  search?: string
}

/** Pagination and sorting options. */
export interface ListOptions {
  page?: number
  pageSize?: number
  sort?: ArtworkSort
}

/**
 * List artworks with optional filters, pagination and sorting.
 * Returns `{ items, total, page, pageSize }`.
 */
export async function listArtworks(
  filters: ListArtworksFilters = {},
  options: ListOptions = {}
) {
  const col = await getArtworksCollection()

  // Build a typed MongoDB query. Filter<ArtworkDoc> keeps field names/operators
  // aligned with the schema, preserving type safety and IDE autocomplete.
  const query: Filter<ArtworkDoc> = {}
  if (filters.tags && filters.tags.length) {
    query.tags = { $in: filters.tags }
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    query.price = {
      ...(filters.minPrice != null ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { $lte: filters.maxPrice } : {}),
    }
  }
  if (filters.artistId) {
    // Convert the incoming artistId to a valid ObjectId so it matches the
    // stored schema; skip assignment if the string is not a valid ObjectId.
    const _id =
      typeof filters.artistId === 'string'
        ? (ObjectId.isValid(filters.artistId) ? new ObjectId(filters.artistId) : undefined)
        : filters.artistId
    if (_id) {
      query.artistId = _id
    }
  }
  if (filters.search && filters.search.trim()) {
    // Case-insensitive partial match on title/description for basic search.
    const r = new RegExp(filters.search.trim(), 'i')
    query.$or = [{ title: r }, { description: r }]
  }

  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 12))
  const skip = (page - 1) * pageSize

  const sort: Sort = (() => {
    switch (options.sort) {
      case 'priceAsc':
        return new Map([[ 'price', 1 as const ]])
      case 'priceDesc':
        return new Map([[ 'price', -1 as const ]])
      case 'new':
      default:
        return new Map([[ 'createdAt', -1 as const ]])
    }
  })()

  const [items, total] = await Promise.all([
    col.find(query).sort(sort).skip(skip).limit(pageSize).toArray(),
    col.countDocuments(query),
  ])

  return { items, total, page, pageSize }
}

/** Get a single artwork by id. Returns null if id is invalid or not found. */
export async function getArtworkById(id: string | ObjectId) {
  const col = await getArtworksCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return null
  return col.findOne({ _id })
}

/** Create a new artwork with timestamps. */
export async function createArtwork(input: Omit<ArtworkDoc, '_id' | 'createdAt' | 'updatedAt'>) {
  const col = await getArtworksCollection()
  const now = new Date()
  const doc: ArtworkDoc = { ...input, createdAt: now, updatedAt: now }
  const res = await col.insertOne(doc)
  return { ...doc, _id: res.insertedId }
}

/** Update an artwork by id with a partial patch. */
export async function updateArtwork(
  id: string | ObjectId,
  patch: Partial<Omit<ArtworkDoc, '_id' | 'createdAt'>>
) {
  const col = await getArtworksCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return { matchedCount: 0, modifiedCount: 0 }
  const res = await col.updateOne({ _id }, { $set: { ...patch, updatedAt: new Date() } })
  return res
}

/** Delete an artwork by id. */
export async function deleteArtwork(id: string | ObjectId) {
  const col = await getArtworksCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return { deletedCount: 0 }
  return col.deleteOne({ _id })
}
