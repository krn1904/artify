import { CardGridSkeleton, ProfileHeaderSkeleton } from '@/components/skeletons'

export default function ArtistProfileLoading() {
  return (
    <div className="container mx-auto py-8">
  <ProfileHeaderSkeleton />

  <div className="h-6 w-40 mb-4 bg-muted rounded" />

  <CardGridSkeleton items={6} />
    </div>
  )
}
