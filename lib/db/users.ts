import { Collection, ObjectId } from 'mongodb'
import getMongoClient from '@/lib/db'

/**
 * User document shape used by auth and profiles.
 * Password is stored as bcrypt hash. Role controls UI and permissions.
 */
export interface UserDoc {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: 'CUSTOMER' | 'ARTIST'
  avatarUrl?: string
  bio?: string
  loginAttempts?: number | null
  lastLoginAttempt?: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Get the users collection and ensure basic indexes. */
export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const client = await getMongoClient()
  const db = client.db('artify')
  const col = db.collection<UserDoc>('users')
  await col.createIndexes([
    { key: { email: 1 }, name: 'email_unique', unique: true },
    { key: { role: 1 }, name: 'role_asc' },
    { key: { createdAt: -1 }, name: 'createdAt_desc' },
  ])
  return col
}

/** List users with role ARTIST for the public Artists page. */
export async function listArtists(page = 1, pageSize = 12) {
  const col = await getUsersCollection()
  const skip = (page - 1) * pageSize
  const query = { role: 'ARTIST' as const }
  const [items, total] = await Promise.all([
    col.find(query).project({ password: 0 }).skip(skip).limit(pageSize).toArray(),
    col.countDocuments(query),
  ])
  return { items, total, page, pageSize }
}

/** Get a user by id with password excluded. */
export async function getUserById(id: string | ObjectId) {
  const col = await getUsersCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return null
  return col.findOne({ _id }, { projection: { password: 0 } })
}

/** Update profile fields (name, avatarUrl, bio). */
export async function updateUserProfile(
  id: string | ObjectId,
  patch: Partial<Pick<UserDoc, 'name' | 'avatarUrl' | 'bio'>>
) {
  const col = await getUsersCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return { matchedCount: 0, modifiedCount: 0 }
  return col.updateOne({ _id }, { $set: { ...patch, updatedAt: new Date() } })
}
