import { Collection, ObjectId, Filter } from 'mongodb'
import { getMongoDatabase } from '@/lib/db'

/** Commission status lifecycle used by dashboards and API flows. */
export type CommissionStatus = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'

/**
 * Commission document shape stored in MongoDB.
 * Only fields and indexes; CRUD helpers will be committed separately.
 */
export interface CommissionDoc {
  _id?: ObjectId
  customerId: ObjectId
  artistId: ObjectId
  title?: string
  brief: string
  budget?: number
  referenceUrls?: string[]
  dueDate?: Date
  status: CommissionStatus
  createdAt: Date
  updatedAt: Date
}

/** Get the commissions collection and ensure indexes. */
export async function getCommissionsCollection(): Promise<Collection<CommissionDoc>> {
  const db = await getMongoDatabase()
  const col = db.collection<CommissionDoc>('commissions')
  await ensureCommissionIndexes(col)
  return col
}

/** Indexes supporting common dashboard queries. */
export async function ensureCommissionIndexes(col?: Collection<CommissionDoc>) {
  const createCommissionIndexes = async (c: Collection<CommissionDoc>) =>
    c.createIndexes([
      { key: { createdAt: -1 }, name: 'createdAt_desc' },
      { key: { artistId: 1 }, name: 'artistId_asc' },
      { key: { customerId: 1 }, name: 'customerId_asc' },
      { key: { status: 1 }, name: 'status_asc' },
      { key: { artistId: 1, status: 1, createdAt: -1 }, name: 'artist_status_createdAt' },
      { key: { customerId: 1, createdAt: -1 }, name: 'customer_createdAt' },
    ])
  if (!col) {
    const db = await getMongoDatabase()
    const c = db.collection<CommissionDoc>('commissions')
    await createCommissionIndexes(c)
    return
  }
  const c = col
  await createCommissionIndexes(c)
}

/**
 * Create a commission request. Defaults to status REQUESTED.
 * Returns the inserted document with `_id`.
 */
export async function createCommission(input: Omit<CommissionDoc, '_id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: CommissionStatus }) {
  const col = await getCommissionsCollection()
  const now = new Date()
  const doc: CommissionDoc = { ...input, status: input.status ?? 'REQUESTED', createdAt: now, updatedAt: now }
  const res = await col.insertOne(doc)
  return { ...doc, _id: res.insertedId }
}

/** Get a single commission by id. */
export async function getCommissionById(id: string | ObjectId) {
  const col = await getCommissionsCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return null
  return col.findOne({ _id })
}

/** List commissions for an artist, optionally filtered by status, newest first. */
export async function listArtistCommissions(artistId: string | ObjectId, status?: CommissionStatus, page = 1, pageSize = 12) {
  const col = await getCommissionsCollection()
  const _artistId = typeof artistId === 'string' ? new ObjectId(artistId) : artistId
  const query: Partial<Pick<CommissionDoc, 'artistId' | 'status'>> = { artistId: _artistId }
  if (status) query.status = status
  const skip = (page - 1) * pageSize
  const [items, total] = await Promise.all([
    col.find(query).sort(new Map([[ 'createdAt', -1 as const ]])).skip(skip).limit(pageSize).toArray(),
    col.countDocuments(query),
  ])
  return { items, total, page, pageSize }
}

/** List commissions created by a customer, newest first. */
export async function listCustomerCommissions(customerId: string | ObjectId, page = 1, pageSize = 12) {
  const col = await getCommissionsCollection()
  const _customerId = typeof customerId === 'string' ? new ObjectId(customerId) : customerId
  const query = { customerId: _customerId }
  const skip = (page - 1) * pageSize
  const [items, total] = await Promise.all([
    col.find(query).sort(new Map([[ 'createdAt', -1 as const ]])).skip(skip).limit(pageSize).toArray(),
    col.countDocuments(query),
  ])
  return { items, total, page, pageSize }
}

/** Update commission status and touch updatedAt. */
export async function updateCommissionStatus(id: string | ObjectId, status: CommissionStatus) {
  const col = await getCommissionsCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return { matchedCount: 0, modifiedCount: 0 }
  return col.updateOne({ _id }, { $set: { status, updatedAt: new Date() } })
}
