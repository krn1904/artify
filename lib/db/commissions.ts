import { Collection, ObjectId } from 'mongodb'
import getMongoClient from '@/lib/db'

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
  brief: string
  budget?: number
  status: CommissionStatus
  createdAt: Date
  updatedAt: Date
}

/** Get the commissions collection and ensure indexes. */
export async function getCommissionsCollection(): Promise<Collection<CommissionDoc>> {
  const client = await getMongoClient()
  const db = client.db('artify')
  const col = db.collection<CommissionDoc>('commissions')
  await ensureCommissionIndexes(col)
  return col
}

/** Indexes supporting common dashboard queries. */
export async function ensureCommissionIndexes(col?: Collection<CommissionDoc>) {
  if (!col) {
    const client = await getMongoClient()
    const db = client.db('artify')
    col = db.collection<CommissionDoc>('commissions')
  }

  await col!.createIndexes([
    { key: { createdAt: -1 }, name: 'createdAt_desc' },
    { key: { artistId: 1 }, name: 'artistId_asc' },
    { key: { customerId: 1 }, name: 'customerId_asc' },
    { key: { status: 1 }, name: 'status_asc' },
    { key: { artistId: 1, status: 1, createdAt: -1 }, name: 'artist_status_createdAt' },
    { key: { customerId: 1, createdAt: -1 }, name: 'customer_createdAt' },
  ])
}
