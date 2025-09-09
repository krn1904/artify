import { NextResponse } from 'next/server'
import { getUsersCollection } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = (url.searchParams.get('q') || '').trim()
    const limit = Math.max(1, Math.min(20, Number(url.searchParams.get('limit')) || 10))

    const col = await getUsersCollection()
    const filter: any = { role: 'ARTIST' }
    if (q.length >= 2) {
      filter.name = { $regex: new RegExp(escapeRegex(q), 'i') }
    }

    const items = await col
      .find(filter, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({
      items: items.map((u) => ({ id: String(u._id), name: u.name, avatarUrl: u.avatarUrl || null })),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

