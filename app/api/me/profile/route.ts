import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getUsersCollection } from '@/lib/db/users'
import { ObjectId } from 'mongodb'
import { sanitizeInput } from '@/lib/utils'
import { UserProfileUpdateSchema } from '@/lib/schemas/user'
import { requireAuth } from '@/lib/authz'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  try { requireAuth(session as any) } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const col = await getUsersCollection()
  const user = await col.findOne({ _id: new ObjectId((session as any).user.id) }, { projection: { password: 0 } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || '',
      bio: user.bio || '',
    },
  })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  try { requireAuth(session as any) } catch (e) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const bodyRaw = await req.json().catch(() => null)
  if (!bodyRaw) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const parsed = UserProfileUpdateSchema.safeParse(bodyRaw)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    return NextResponse.json({ error: 'Validation failed', details: flat }, { status: 400 })
  }

  const patch: Record<string, any> = {}
  if (parsed.data.name !== undefined) patch.name = sanitizeInput(parsed.data.name)
  if (parsed.data.avatarUrl !== undefined) patch.avatarUrl = parsed.data.avatarUrl || null
  if (parsed.data.bio !== undefined) patch.bio = sanitizeInput(parsed.data.bio || '')
  // Role changes are currently disabled; ignore incoming role updates
  patch.updatedAt = new Date()

  const col = await getUsersCollection()
  const res = await col.updateOne({ _id: new ObjectId((session as any).user.id) }, { $set: patch })
  if (res.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
