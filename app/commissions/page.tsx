import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Commissions | Artify',
  description: 'Start a new art commission or review requests.',
}

export default async function CommissionsHubPage() {
  const session = await getServerSession(authOptions)

  // If logged in, send users directly to the most relevant place.
  if (session?.user?.role === 'ARTIST') {
    // Artists: go to incoming requests (dashboard page will host the lists)
    redirect('/dashboard')
  }
  if (session?.user?.id) {
    // Customers: start a new commission for now (dashboard lists coming soon)
    redirect('/commissions/new')
  }

  // Guests see a simple explainer and CTAs.
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-2">Commissions</h1>
      <p className="text-muted-foreground mb-8">
        Work with your favorite artists on custom pieces. Log in to start a new request
        or browse artists to find the right fit.
      </p>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login?callbackUrl=%2Fcommissions">Log in to start</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/artists">Browse artists</Link>
        </Button>
      </div>
    </div>
  )
}
