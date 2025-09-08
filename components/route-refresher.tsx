"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RouteRefresher({
  intervalMs = 15000,
  onMount = true,
  onFocus = true,
  onInterval = true,
}: {
  intervalMs?: number
  onMount?: boolean
  onFocus?: boolean
  onInterval?: boolean
}) {
  const router = useRouter()

  useEffect(() => {
    if (onMount) {
      // Force a fresh fetch once on mount to avoid any lingering caches
      router.refresh()
    }

    const handleFocus = () => {
      if (onFocus) router.refresh()
    }
    window.addEventListener('focus', handleFocus)

    let id: any
    if (onInterval && intervalMs > 0) {
      id = setInterval(() => router.refresh(), intervalMs)
    }

    return () => {
      window.removeEventListener('focus', handleFocus)
      if (id) clearInterval(id)
    }
  }, [router, intervalMs, onMount, onFocus, onInterval])

  return null
}

export default RouteRefresher

