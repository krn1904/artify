import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArtworkById } from '@/lib/db/artworks'
import { getUserById } from '@/lib/db/users'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import { CloseBack } from '@/components/close-back'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const art = await getArtworkById(params.id)
  if (!art) return { title: 'Artwork Not Found | Artify' }
  return {
    title: `${art.title} | Artify`,
    description: art.description || 'Artwork details on Artify.',
  }
}

interface PageProps {
  params: { id: string }
}

// Artwork detail page: full view for a single artwork.
export default async function ArtworkDetailPage({ params }: PageProps) {
  const art = await getArtworkById(params.id)
  if (!art) return notFound()

  const artist = await getUserById(art.artistId)

  return (
    <div className="container mx-auto py-8 relative">
      {/* Top-right close control to navigate back */}
      <div className="absolute right-4 top-4 z-10">
        <CloseBack label="Close details" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image
            src={art.imageUrl}
            alt={art.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover rounded-md"
            priority
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">{art.title}</h1>
          <div className="mt-2 text-sm text-muted-foreground">
            by {artist ? (
              <Link href={`/artist/${String(artist._id)}`} className="underline">
                {artist.name}
              </Link>
            ) : (
              'Unknown artist'
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">${art.price}</span>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Favorite
            </Button>
          </div>

          {art.tags?.length ? (
            <div className="mt-3 text-xs text-muted-foreground">{art.tags.join(', ')}</div>
          ) : null}

          {art.description ? (
            <Card className="mt-6">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-sm leading-relaxed">{art.description}</p>
              </CardContent>
            </Card>
          ) : null}

          <div className="mt-6">
            <Button asChild>
              <Link href={`/artist/${String(art.artistId)}`}>View artist profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
