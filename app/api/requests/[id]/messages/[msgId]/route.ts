import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth/authOptions'
import { requireAuth } from '@/lib/auth/authz'
import { getRequestById, updateRequestBudget } from '@/lib/db/requests'
import { getMessageById, updateBidProposalStatus } from '@/lib/db/messages'
import { BidProposalResponseSchema } from '@/lib/schemas/message'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; msgId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    try { requireAuth(session as any) } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    const { id, msgId } = await params
    if (!ObjectId.isValid(id) || !ObjectId.isValid(msgId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const request = await getRequestById(id)
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const uid = (session as any).user.id

    // Only the buyer (customer) can respond to bid proposals
    if (String(request.customerId) !== uid) {
      return NextResponse.json({ error: 'Only the buyer can respond to bid proposals' }, { status: 403 })
    }

    if (request.status === 'DECLINED' || request.status === 'COMPLETED') {
      return NextResponse.json({ error: 'This request is closed' }, { status: 400 })
    }

    const message = await getMessageById(msgId)
    if (!message || String(message.requestId) !== id) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (message.type !== 'bid_proposal') {
      return NextResponse.json({ error: 'This message is not a bid proposal' }, { status: 400 })
    }

    if (message.bidProposal?.status !== 'pending') {
      return NextResponse.json({ error: 'This bid proposal is no longer pending' }, { status: 400 })
    }

    const body = await req.json().catch(() => null)
    const parsed = BidProposalResponseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const { action } = parsed.data
    await updateBidProposalStatus(msgId, action)

    if (action === 'accepted') {
      await updateRequestBudget(id, message.bidProposal!.amount)
    }

    return NextResponse.json({ ok: true, action })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
