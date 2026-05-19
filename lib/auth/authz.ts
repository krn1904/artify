import type { Session } from 'next-auth'

export function requireAuth(session: Session | null) {
  if (!session?.user?.id) throw new Error('Unauthorized')
}

export function requireArtist(session: Session | null) {
  requireAuth(session)
  if (session!.user.role !== 'ARTIST') throw new Error('Forbidden')
}

