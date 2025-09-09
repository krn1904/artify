import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/authOptions'
import { createArtwork, listArtworks } from '@/lib/db/artworks'
import { ObjectId } from 'mongodb'
import { sanitizeInput } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ARTIST') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const res = await listArtworks({ artistId: session.user.id }, { page: 1, pageSize: 100, sort: 'new' })
  return NextResponse.json(res)
}

const BodySchema = z.object({
  title: z.string().trim().min(3, 'Title too short').max(120),
  imageUrl: z.string().url('Image URL must be a valid URL'),
  price: z.preprocess((v) => {
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  }, z.number().nonnegative('Price must be non-negative')),
  description: z.string().trim().max(2000).optional(),
  tags: z
    .preprocess((v) => {
      if (Array.isArray(v)) return v
      if (typeof v === 'string') {
        return v
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      return []
    }, z.array(z.string()).max(5, 'Up to 5 tags'))
    .optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ARTIST') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const bodyRaw = await req.json().catch(() => null)
  if (!bodyRaw) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const parsed = BodySchema.safeParse(bodyRaw)
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

