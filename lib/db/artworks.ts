import { Collection, ObjectId } from 'mongodb'
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

/** Create indexes used by Explore and profile pages. */
export async function ensureArtworksIndexes(col?: Collection<ArtworkDoc>) {
  if (!col) {
    const client = await getMongoClient()
    const db = client.db('artify')
    col = db.collection<ArtworkDoc>('artworks')
  }

  await col!.createIndexes([
    { key: { createdAt: -1 }, name: 'createdAt_desc' },
    { key: { price: 1 }, name: 'price_asc' },
    { key: { artistId: 1 }, name: 'artistId_asc' },
    { key: { tags: 1 }, name: 'tags_asc' },
  ])
}
