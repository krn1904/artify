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
  if (!col) {
    const client = await getMongoClient()
    const db = client.db('artify')
    col = db.collection<FavoriteDoc>('favorites')
  }

  await col!.createIndexes([
    { key: { userId: 1, artworkId: 1 }, name: 'uniq_user_artwork', unique: true },
    { key: { userId: 1, createdAt: -1 }, name: 'user_createdAt' },
    { key: { artworkId: 1 }, name: 'artworkId_asc' },
  ])
}
