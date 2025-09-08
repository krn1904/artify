import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/authOptions'
import { getCommissionById, updateCommissionStatus, type CommissionStatus } from '@/lib/db/commissions'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const c = await getCommissionById(id)
    if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const uid = session.user.id
    const isParty = String(c.artistId) === uid || String(c.customerId) === uid
    if (!isParty) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ commission: {
      id: String(c._id),
      artistId: String(c.artistId),
      customerId: String(c.customerId),
      title: c.title || null,
      brief: c.brief,
      budget: c.budget ?? null,
      referenceUrls: c.referenceUrls ?? [],
      dueDate: c.dueDate ?? null,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const c = await getCommissionById(id)
    if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only the artist can change status (accept/decline) for now
    if (String(c.artistId) !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body.status !== 'string') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const status = body.status as CommissionStatus
    if (!['ACCEPTED', 'DECLINED', 'COMPLETED', 'REQUESTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Enforce valid transitions
    const from = c.status
    const allowed: Record<string, Array<'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'REQUESTED'>> = {
      REQUESTED: ['ACCEPTED', 'DECLINED'],
      ACCEPTED: ['COMPLETED'],
      DECLINED: [],
      COMPLETED: [],
    }

    if (status === from) {
      return NextResponse.json({ ok: true })
    }
    if (!allowed[from]?.includes(status)) {
      return NextResponse.json({ error: `Invalid transition from ${from} to ${status}` }, { status: 400 })
    }

    const res = await updateCommissionStatus(id, status)
    if (res.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
