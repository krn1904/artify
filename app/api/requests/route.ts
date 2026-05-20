import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth/authOptions'
import { createRequest } from '@/lib/db/requests'
import { getUserById } from '@/lib/db/users'
import { RequestCreateSchema } from '@/lib/schemas/request'
import { requireAuth } from '@/lib/auth/authz'

export const dynamic = 'force-dynamic'

// Shared schema imported from lib/schemas

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    try { requireAuth(session as any) } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    // Parse and validate body
  // Clone the request before parsing JSON to avoid dev-mode stream reuse issues
  const raw = await req.clone().json().catch(() => null)
    if (!raw) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const body = RequestCreateSchema.safeParse(raw)
    if (!body.success) {
      const flat = body.error.flatten()
      return NextResponse.json({ error: 'Validation failed', details: flat }, { status: 400 })
    }

    // Ensure artist exists and is an artist
    const artist = await getUserById(body.data.artistId)
    if (!artist || artist.role !== 'ARTIST') {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    // Prevent self-request: an artist/customer cannot request themself
    if ((session as any).user.id === body.data.artistId) {
      return NextResponse.json({ error: 'You cannot create a request for yourself' }, { status: 400 })
    }

    const doc = await createRequest({
      artistId: new ObjectId(body.data.artistId),
      customerId: new ObjectId((session as any).user.id),
      title: body.data.title,
      brief: body.data.brief,
      budget: body.data.budget,
      referenceUrls: body.data.referenceUrls,
      dueDate: body.data.dueDate as Date | undefined,
    })

    return NextResponse.json({ id: String(doc._id) }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
