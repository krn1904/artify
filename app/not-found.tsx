import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="underline text-sm">Return home</Link>
    </div>
  )
}

