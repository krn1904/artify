import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/authOptions'
import { createCommission } from '@/lib/db/commissions'
import { getUserById } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  artistId: z.string().trim().refine((v) => ObjectId.isValid(v), 'Invalid artist id'),
  brief: z.string().trim().min(10, 'Please provide a short brief (min 10 chars)').max(2000),
  budget: z
    .preprocess((v) => {
      if (v == null) return undefined
      if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
      if (typeof v === 'string') {
        const s = v.trim()
        if (s === '') return undefined
        const n = Number(s)
        return Number.isFinite(n) ? n : undefined
      }
      return undefined
    }, z.number().nonnegative('Budget must be a positive number'))
    .optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate body
  // Clone the request before parsing JSON to avoid dev-mode stream reuse issues
  const raw = await req.clone().json().catch(() => null)
    if (!raw) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    // Normalize: if budget is empty string or null, drop it before validation
    const normalized = { ...raw }
    if (Object.prototype.hasOwnProperty.call(normalized, 'budget')) {
      const b = normalized.budget
      if (b == null || (typeof b === 'string' && b.trim() === '')) delete normalized.budget
    }
    const body = BodySchema.safeParse(normalized)
    if (!body.success) {
      const flat = body.error.flatten()
      return NextResponse.json({ error: 'Validation failed', details: flat }, { status: 400 })
    }

    // Ensure artist exists and is an artist
    const artist = await getUserById(body.data.artistId)
    if (!artist || artist.role !== 'ARTIST') {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

  const doc = await createCommission({
      artistId: new ObjectId(body.data.artistId),
      customerId: new ObjectId(session.user.id),
      brief: body.data.brief,
      budget: body.data.budget,
    })

    return NextResponse.json({ id: String(doc._id) }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
