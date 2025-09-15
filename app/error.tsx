"use client"

import { Button } from '@/components/ui/button'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <div className="container mx-auto max-w-2xl py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-6">An unexpected error occurred. Try again or go back home.</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => reset()}>Try again</Button>
            <a className="underline text-sm" href="/">Go home</a>
          </div>
        </div>
      </body>
    </html>
  )
}

