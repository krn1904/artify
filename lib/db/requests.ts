import { Collection, ObjectId, Filter } from 'mongodb'
import { getMongoDatabase } from '@/lib/db'

// Keep the legacy collection name for compatibility with existing data.
const REQUESTS_COLLECTION = 'commissions'

/** Request status lifecycle used by dashboards and API flows. */
export type RequestStatus = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'

/**
 * Request document shape stored in MongoDB.
 * Only fields and indexes; CRUD helpers will be committed separately.
 */
export interface RequestDoc {
  _id?: ObjectId
  customerId: ObjectId
  artistId: ObjectId
  title?: string
  brief: string
  budget?: number
  referenceUrls?: string[]
  dueDate?: Date
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
}

/** Get the requests collection and ensure indexes. */
export async function getRequestsCollection(): Promise<Collection<RequestDoc>> {
  const db = await getMongoDatabase()
  const col = db.collection<RequestDoc>(REQUESTS_COLLECTION)
  await ensureRequestIndexes(col)
  return col
}

/** Indexes supporting common dashboard queries. */
export async function ensureRequestIndexes(col?: Collection<RequestDoc>) {
  const createRequestIndexes = async (c: Collection<RequestDoc>) =>
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
    const c = db.collection<RequestDoc>(REQUESTS_COLLECTION)
    await createRequestIndexes(c)
    return
  }
  const c = col
  await createRequestIndexes(c)
}

/**
 * Create a new request. Defaults to status REQUESTED.
 * Returns the inserted document with `_id`.
 */
export async function createRequest(input: Omit<RequestDoc, '_id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: RequestStatus }) {
  const col = await getRequestsCollection()
  const now = new Date()
  const doc: RequestDoc = { ...input, status: input.status ?? 'REQUESTED', createdAt: now, updatedAt: now }
  const res = await col.insertOne(doc)
  return { ...doc, _id: res.insertedId }
}

/** Get a single request by id. */
export async function getRequestById(id: string | ObjectId) {
  const col = await getRequestsCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return null
  return col.findOne({ _id })
}

/** List requests for an artist, optionally filtered by status, newest first. */
export async function listArtistRequests(artistId: string | ObjectId, status?: RequestStatus, page = 1, pageSize = 12) {
  const col = await getRequestsCollection()
  const _artistId = typeof artistId === 'string' ? new ObjectId(artistId) : artistId
  const query: Partial<Pick<RequestDoc, 'artistId' | 'status'>> = { artistId: _artistId }
  if (status) query.status = status
  const skip = (page - 1) * pageSize
  const [items, total] = await Promise.all([
    col.find(query).sort(new Map([[ 'createdAt', -1 as const ]])).skip(skip).limit(pageSize).toArray(),
    col.countDocuments(query),
  ])
  return { items, total, page, pageSize }
}

/** List requests created by a customer, newest first. */
export async function listCustomerRequests(customerId: string | ObjectId, page = 1, pageSize = 12) {
  const col = await getRequestsCollection()
  const _customerId = typeof customerId === 'string' ? new ObjectId(customerId) : customerId
  const query = { customerId: _customerId }
  const skip = (page - 1) * pageSize
  const [items, total] = await Promise.all([
    col.find(query).sort(new Map([[ 'createdAt', -1 as const ]])).skip(skip).limit(pageSize).toArray(),
    col.countDocuments(query),
  ])
  return { items, total, page, pageSize }
}

/** Update request status and touch updatedAt. */
export async function updateRequestStatus(id: string | ObjectId, status: RequestStatus) {
  const col = await getRequestsCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return { matchedCount: 0, modifiedCount: 0 }
  return col.updateOne({ _id }, { $set: { status, updatedAt: new Date() } })
}
