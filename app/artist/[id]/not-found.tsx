import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto py-20 flex flex-col items-center text-center gap-4">
      <div className="rounded-full bg-muted w-16 h-16 flex items-center justify-center">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold">Artist not found</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        The artist you’re looking for doesn’t exist or the link is incorrect. Try browsing all artists.
      </p>
      <div className="mt-2">
        <Button asChild>
          <Link href="/artists">Browse artists</Link>
        </Button>
      </div>
    </div>
  )
}
