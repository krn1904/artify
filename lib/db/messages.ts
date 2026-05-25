import { Collection, ObjectId } from 'mongodb'
import { getMongoDatabase } from '@/lib/db'

export interface MessageDoc {
  _id?: ObjectId
  requestId: ObjectId
  senderId: ObjectId
  body: string
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

export async function createMessage(input: {
  requestId: ObjectId
  senderId: ObjectId
  body: string
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
