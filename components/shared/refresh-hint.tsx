"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function RefreshHint({ intervalMs = 0 }: { intervalMs?: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  function handleClick() {
    if (loading) return
    setLoading(true)
    router.refresh()
    timer.current = setTimeout(() => setLoading(false), 600)
  }

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2"
        onClick={handleClick}
        disabled={loading}
        title="Re-fetch latest"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Refresh'}
      </Button>
    </div>
  )
}

