import { CardGridSkeleton, ChipsRowSkeleton } from '@/components/skeletons'

export default function ExploreLoading() {
  return (
    <div className="container mx-auto py-8">
  <div className="h-8 w-56 mb-6 bg-muted rounded" />
  <ChipsRowSkeleton />
  <CardGridSkeleton />
    </div>
  )
}
