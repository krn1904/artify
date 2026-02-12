import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { ObjectId } from 'mongodb'
import { getArtworksCollection } from '@/lib/db/artworks'
import { requireArtist } from '@/lib/authz'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  try { requireArtist(session as any) } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: msg === 'Forbidden' ? 403 : 401 })
  }

  const { id } = await params
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const _id = new ObjectId(id)

  // Atomic, ownership-guarded delete to avoid race conditions
  const col = await getArtworksCollection()
  const res = await col.deleteOne({ _id, artistId: new ObjectId((session as any).user.id) })
  if (res.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
