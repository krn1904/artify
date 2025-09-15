import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { ArtworkForm } from './artwork-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Add Artwork | Artify',
  description: 'Add a new artwork to your portfolio.',
}

export default async function NewArtworkPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'ARTIST') redirect('/dashboard')

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Add artwork</h1>
      <p className="text-muted-foreground mb-6">Paste an image URL and details. You can upload images later.</p>
      <ArtworkForm />
    </div>
  )
}
