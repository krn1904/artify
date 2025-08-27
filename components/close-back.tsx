// Lightweight close (back) button used on full-page views.
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

// Clicking goes back in history. Provide an accessible label if needed.
export function CloseBack({ label = 'Close' }: { label?: string }) {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={() => router.back()}
    >
      <X className="h-5 w-5" />
    </Button>
  )
}
