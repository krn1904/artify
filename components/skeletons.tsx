import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function ChipsRowSkeleton({ count = 5, showRightCounter = true }: { count?: number; showRightCounter?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 items-center">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-28 rounded-md" />
      ))}
      {showRightCounter && (
        <div className="ml-auto">
          <Skeleton className="h-4 w-24" />
        </div>
      )}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-20 mt-3" />
        <Skeleton className="h-3 w-2/3 mt-2" />
      </div>
    </div>
  )
}

export function CardGridSkeleton({ items = 9 }: { items?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-start gap-4 mb-6">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48 mt-2" />
        <Skeleton className="h-4 w-full max-w-2xl mt-3" />
      </div>
    </div>
  )
}

export function ArtworkDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Skeleton className="aspect-square w-full rounded-md" />
      <div>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-40 mt-3" />
        <Skeleton className="h-6 w-24 mt-4" />
        <Skeleton className="h-4 w-32 mt-3" />
        <div className="mt-6">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-16 w-full max-w-xl" />
        </div>
      </div>
    </div>
  )
}
