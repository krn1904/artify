"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // console.error(error)
  }, [error])

  return (
    <div className="container mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Unable to load Explore</h1>
      <p className="text-sm text-muted-foreground mb-6">Please retry. If the issue persists, try reloading the page.</p>
      <Button onClick={() => reset()}>Retry</Button>
    </div>
  )
}

