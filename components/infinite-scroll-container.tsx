'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

type InfiniteScrollContainerProps<T> = {
  initialData: T[]
  initialPage: number
  hasMore: boolean
  fetchMore: (page: number) => Promise<{ items: T[]; hasMore: boolean }>
  renderItem: (item: T) => React.ReactNode
  getItemKey: (item: T) => string
  gridClassName?: string
  loadingMessage?: string
  endMessage?: string
}

export function InfiniteScrollContainer<T>({
  initialData,
  initialPage,
  hasMore: initialHasMore,
  fetchMore,
  renderItem,
  getItemKey,
  gridClassName = 'grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6',
  loadingMessage = 'Loading more...',
  endMessage = 'No more items to load',
}: InfiniteScrollContainerProps<T>) {
  const [items, setItems] = useState<T[]>(initialData)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  // Reset state when initialData changes (filter change)
  useEffect(() => {
    setItems(initialData)
    setPage(initialPage)
    setHasMore(initialHasMore)
    setError(null)
    loadingRef.current = false
  }, [initialData, initialPage, initialHasMore])

  const loadMore = useCallback(async () => {
    // Prevent duplicate requests
    if (loadingRef.current || !hasMore) return
    
    loadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const nextPage = page + 1
      const result = await fetchMore(nextPage)
      
      if (result.items.length > 0) {
        setItems((prev) => [...prev, ...result.items])
        setPage(nextPage)
        setHasMore(result.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      setError('Failed to load more items. Please try again.')
      console.error('Error loading more items:', err)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [page, hasMore, fetchMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMore])

  return (
    <>
      <div className={gridClassName}>
        {items.map((item) => (
          <div key={getItemKey(item)}>{renderItem(item)}</div>
        ))}
      </div>

      {/* Observer trigger element */}
      <div ref={observerTarget} className="flex justify-center py-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{loadingMessage}</span>
          </div>
        )}
        {!isLoading && !hasMore && items.length > 0 && (
          <div className="text-sm text-muted-foreground">{endMessage}</div>
        )}
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
      </div>
    </>
  )
}
