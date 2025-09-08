import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getUserById } from '@/lib/db/users'
import { CommissionRequestForm } from '@/app/commissions/new/request-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Request a commission | Artify',
}

interface PageProps { searchParams?: { artistId?: string } }

export default async function NewCommissionPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const artistId = searchParams?.artistId
  const artist = artistId ? await getUserById(artistId) : null

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Request a commission</h1>
      <p className="text-muted-foreground mb-6">Share your idea and budget. The artist will review and respond.</p>

      <CommissionRequestForm presetArtist={artist ? { id: String(artist._id), name: artist.name } : undefined} />
    </div>
  )
}
