import { Collection, ObjectId } from 'mongodb'
import { getMongoDatabase } from '@/lib/db'

export type BidProposalStatus = 'pending' | 'accepted' | 'declined'

export interface BidProposal {
  amount: number
  status: BidProposalStatus
}

export interface MessageDoc {
  _id?: ObjectId
  requestId: ObjectId
  senderId: ObjectId
  type: 'text' | 'bid_proposal'
  body: string
  bidProposal?: BidProposal
  readAt?: Date | null
  createdAt: Date
}

export async function getMessagesCollection(): Promise<Collection<MessageDoc>> {
  const db = await getMongoDatabase()
  const col = db.collection<MessageDoc>('messages')
  await col.createIndexes([
    { key: { requestId: 1, createdAt: 1 }, name: 'requestId_createdAt' },
    { key: { requestId: 1, readAt: 1 }, name: 'requestId_readAt' },
  ])
  return col
}

export async function listMessages(requestId: string | ObjectId, limit = 200) {
  const col = await getMessagesCollection()
  const _id = typeof requestId === 'string' ? new ObjectId(requestId) : requestId
  return col.find({ requestId: _id }).sort({ createdAt: 1 }).limit(limit).toArray()
}

export async function getMessageById(id: string | ObjectId) {
  const col = await getMessagesCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return null
  return col.findOne({ _id })
}

export async function createMessage(input: {
  requestId: ObjectId
  senderId: ObjectId
  type: 'text' | 'bid_proposal'
  body: string
  bidProposal?: BidProposal
}) {
  const col = await getMessagesCollection()
  const doc: MessageDoc = { ...input, readAt: null, createdAt: new Date() }
  const res = await col.insertOne(doc)
  return { ...doc, _id: res.insertedId }
}

export async function markMessagesRead(requestId: string | ObjectId, recipientId: string | ObjectId) {
  const col = await getMessagesCollection()
  const _requestId = typeof requestId === 'string' ? new ObjectId(requestId) : requestId
  const _recipientId = typeof recipientId === 'string' ? new ObjectId(recipientId) : recipientId
  return col.updateMany(
    { requestId: _requestId, senderId: { $ne: _recipientId }, readAt: null },
    { $set: { readAt: new Date() } }
  )
}

export async function hasPendingBidProposal(requestId: string | ObjectId): Promise<boolean> {
  const col = await getMessagesCollection()
  const _id = typeof requestId === 'string' ? new ObjectId(requestId) : requestId
  const count = await col.countDocuments({ requestId: _id, type: 'bid_proposal', 'bidProposal.status': 'pending' })
  return count > 0
}

export async function updateBidProposalStatus(id: string | ObjectId, status: 'accepted' | 'declined') {
  const col = await getMessagesCollection()
  const _id = typeof id === 'string' ? (ObjectId.isValid(id) ? new ObjectId(id) : undefined) : id
  if (!_id) return { matchedCount: 0, modifiedCount: 0 }
  return col.updateOne({ _id }, { $set: { 'bidProposal.status': status } })
}
