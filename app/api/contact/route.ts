import getMongoClient from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()
    const subject = String(body?.subject || '').trim()
    const message = String(body?.message || '').trim()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('artify')
    const col = db.collection('contact_messages')
    const doc = {
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
      status: 'NEW' as const,
    }
    await col.insertOne(doc)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

