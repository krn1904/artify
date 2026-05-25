import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth/authOptions'
import { requireAuth } from '@/lib/auth/authz'
import { getRequestById } from '@/lib/db/requests'
import { listMessages, createMessage, markMessagesRead } from '@/lib/db/messages'
import { MessageCreateSchema } from '@/lib/schemas/message'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    try { requireAuth(session as any) } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    const { id } = await params
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const request = await getRequestById(id)
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const uid = (session as any).user.id
    if (String(request.artistId) !== uid && String(request.customerId) !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await listMessages(id)
    await markMessagesRead(id, uid)

    return NextResponse.json({
      messages: raw.map((m) => ({
        id: String(m._id),
        senderId: String(m.senderId),
        body: m.body,
        readAt: m.readAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      })),
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    try { requireAuth(session as any) } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    const { id } = await params
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const request = await getRequestById(id)
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (request.status === 'DECLINED' || request.status === 'COMPLETED') {
      return NextResponse.json({ error: 'This request is closed for new messages' }, { status: 400 })
    }

    const uid = (session as any).user.id
    if (String(request.artistId) !== uid && String(request.customerId) !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    const parsed = MessageCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const message = await createMessage({
      requestId: request._id!,
      senderId: new ObjectId(uid),
      body: parsed.data.body,
    })

    return NextResponse.json({
      message: {
        id: String(message._id),
        senderId: String(message.senderId),
        body: message.body,
        readAt: message.readAt ?? null,
        createdAt: message.createdAt.toISOString(),
      },
    }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
