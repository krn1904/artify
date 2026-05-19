import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto max-w-3xl py-10">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

