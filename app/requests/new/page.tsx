import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getUserById } from '@/lib/db/users'
import { getArtworkById } from '@/lib/db/artworks'
import { ArtworkRequestForm } from '@/app/requests/new/request-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'New Custom Request | Artify',
}

interface PageProps { searchParams?: Promise<{ artistId?: string; artworkId?: string }> }

export default async function NewRequestPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const params = searchParams ? await searchParams : {}
  const artworkId = params?.artworkId
  const artwork = artworkId ? await getArtworkById(artworkId) : null
  const resolvedArtistId = artwork ? String(artwork.artistId) : params?.artistId
  const artist = resolvedArtistId ? await getUserById(resolvedArtistId) : null
  const appBaseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">New custom request</h1>
      <p className="text-muted-foreground mb-6">Share your idea and budget. The artist will review and respond.</p>

      <ArtworkRequestForm
        presetArtist={artist ? { id: String(artist._id), name: artist.name } : undefined}
        presetArtwork={
          artwork
            ? {
                id: String(artwork._id),
                title: artwork.title,
                imageUrl: artwork.imageUrl,
                price: artwork.price,
                url: `${appBaseUrl}/artwork/${String(artwork._id)}`,
              }
            : undefined
        }
        viewerId={session.user.id}
      />
    </div>
  )
}
