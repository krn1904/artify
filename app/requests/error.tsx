"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Optionally log to an error reporting service
    // console.error(error)
  }, [error])

  return (
    <div className="container mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground mb-6">We couldn’t load this view. Try again in a moment.</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}

