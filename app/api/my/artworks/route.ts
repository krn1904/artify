import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { createArtwork, listArtworks } from '@/lib/db/artworks'
import { ObjectId } from 'mongodb'
import { sanitizeInput } from '@/lib/utils'
import { ArtworkCreateBodySchema } from '@/lib/schemas/artwork'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ARTIST') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const res = await listArtworks({ artistId: session.user.id }, { page: 1, pageSize: 100, sort: 'new' })
  return NextResponse.json(res)
}


export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ARTIST') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const bodyRaw = await req.json().catch(() => null)
  if (!bodyRaw) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const parsed = ArtworkCreateBodySchema.safeParse(bodyRaw)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return NextResponse.json({ error: 'Validation failed', details: flat }, { status: 400 })
  }

  const { title, imageUrl, price, description, tags } = parsed.data
  const doc = await createArtwork({
    title: sanitizeInput(title),
    imageUrl: imageUrl,
    price,
    description: description ? sanitizeInput(description) : undefined,
    tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
    artistId: new ObjectId(session.user.id),
  })
  return NextResponse.json({ id: String(doc._id) }, { status: 201 })
}
