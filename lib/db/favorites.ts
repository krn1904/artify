import { Collection, ObjectId } from 'mongodb'
import getMongoClient from '@/lib/db'

/** Favorite document mapping a user to an artwork. */
export interface FavoriteDoc {
  _id?: ObjectId
  userId: ObjectId
  artworkId: ObjectId
  createdAt: Date
}

/** Get the favorites collection and ensure indexes. */
export async function getFavoritesCollection(): Promise<Collection<FavoriteDoc>> {
  const client = await getMongoClient()
  const db = client.db('artify')
  const col = db.collection<FavoriteDoc>('favorites')
  await ensureFavoritesIndexes(col)
  return col
}

/** Prevent duplicates and support fast lookups/listing. */
export async function ensureFavoritesIndexes(col?: Collection<FavoriteDoc>) {
  const createFavoritesIndexes = async (c: Collection<FavoriteDoc>) =>
    c.createIndexes([
      { key: { userId: 1, artworkId: 1 }, name: 'uniq_user_artwork', unique: true },
      { key: { userId: 1, createdAt: -1 }, name: 'user_createdAt' },
      { key: { artworkId: 1 }, name: 'artworkId_asc' },
    ])
  if (!col) {
    const client = await getMongoClient()
    const db = client.db('artify')
    const c = db.collection<FavoriteDoc>('favorites')
    await createFavoritesIndexes(c)
    return
  }
  const c = col
  await createFavoritesIndexes(c)
}

/** Toggle favorite: add if missing, remove if exists. Returns true if now favorited. */
export async function toggleFavorite(userId: string | ObjectId, artworkId: string | ObjectId) {
  const col = await getFavoritesCollection()
  const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId
  const _artworkId = typeof artworkId === 'string' ? new ObjectId(artworkId) : artworkId
  const exists = await col.findOne({ userId: _userId, artworkId: _artworkId })
  if (exists) {
    await col.deleteOne({ _id: exists._id })
    return false
  }
  await col.insertOne({ userId: _userId, artworkId: _artworkId, createdAt: new Date() })
  return true
}

/** List a user's favorites, newest first, with pagination. */
export async function listFavoritesByUser(userId: string | ObjectId, page = 1, pageSize = 12) {
  const col = await getFavoritesCollection()
  const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId
  const skip = (page - 1) * pageSize
  const [items, total] = await Promise.all([
    col.find({ userId: _userId }).sort(new Map([[ 'createdAt', -1 as const ]])).skip(skip).limit(pageSize).toArray(),
    col.countDocuments({ userId: _userId }),
  ])
  return { items, total, page, pageSize }
}

/** Count how many users have favorited a given artwork. */
export async function countFavoritesForArtwork(artworkId: string | ObjectId) {
  const col = await getFavoritesCollection()
  const _artworkId = typeof artworkId === 'string' ? new ObjectId(artworkId) : artworkId
  return col.countDocuments({ artworkId: _artworkId })
}

/** Returns true if the user has favorited the artwork. */
export async function isFavorited(userId: string | ObjectId, artworkId: string | ObjectId) {
  const col = await getFavoritesCollection()
  const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId
  const _artworkId = typeof artworkId === 'string' ? new ObjectId(artworkId) : artworkId
  const doc = await col.findOne({ userId: _userId, artworkId: _artworkId }, { projection: { _id: 1 } })
  return !!doc
}
