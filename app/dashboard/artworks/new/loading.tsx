import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96 mb-6" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-80" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  )
}

