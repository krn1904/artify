import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { getUserById } from '@/lib/db/users'
import { CommissionRequestForm } from '@/app/requests/new/request-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Custom Request | Artify',
}

interface PageProps { searchParams?: Promise<{ artistId?: string; artworkId?: string }> }

export default async function NewRequestPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const params = searchParams ? await searchParams : {}
  const artistId = params?.artistId
  const artist = artistId ? await getUserById(artistId) : null

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">New custom request</h1>
      <p className="text-muted-foreground mb-6">Share your idea and budget. The artist will review and respond.</p>

      <CommissionRequestForm
        presetArtist={artist ? { id: String(artist._id), name: artist.name } : undefined}
        viewerId={session.user.id}
      />
    </div>
  )
}
