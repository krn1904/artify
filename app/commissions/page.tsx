import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { listArtistCommissions, listCustomerCommissions, type CommissionDoc } from '@/lib/db/commissions'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Inbox, Archive as ArchiveIcon } from 'lucide-react'
import RouteRefresher from '@/components/shared/route-refresher'
import RefreshHint from '@/components/shared/refresh-hint'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Commissions | Artify',
  description: 'Start a new art commission or review requests.',
}

function StatusBadge({ status }: { status: CommissionDoc['status'] }) {
  const map: Record<CommissionDoc['status'], string> = {
    REQUESTED: 'secondary',
    ACCEPTED: 'default',
    DECLINED: 'destructive',
    COMPLETED: 'outline',
  }
  return <Badge variant={map[status] as any}>{status}</Badge>
}

function CommissionRow({ c }: { c: CommissionDoc }) {
  const date = new Date(c.createdAt).toLocaleDateString()
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div>
        <div className="font-medium">{c.title || 'Untitled commission'}</div>
        <div className="text-sm text-muted-foreground">{date}</div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={c.status} />
      </div>
    </div>
  )
}

export default async function CommissionsHubPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
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

  const isArtist = session.user.role === 'ARTIST'

  if (isArtist) {
    const incoming = await listArtistCommissions(session.user.id, 'REQUESTED', 1, 20)
    const archiveAll = await listArtistCommissions(session.user.id, undefined, 1, 20)
    const archive = archiveAll.items.filter((c) => c.status !== 'REQUESTED')

    return (
      <div className="container mx-auto max-w-3xl py-10">
        <RouteRefresher intervalMs={15000} onMount onFocus onInterval />
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Incoming commissions</h1>
          <RefreshHint intervalMs={15000} />
        </div>
        <div className="h-4" />
        <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">
            Incoming
            {incoming.total > 0 ? <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-medium text-secondary-foreground">{incoming.total}</span> : null}
          </TabsTrigger>
          <TabsTrigger value="archive">
            Archive
            {archive.length > 0 ? <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-foreground/80">{archive.length}</span> : null}
          </TabsTrigger>
        </TabsList>
          <TabsContent value="incoming" className="mt-4">
            {incoming.total === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-md border py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-3">
                  <Inbox className="h-6 w-6" />
                </div>
                <div className="font-medium text-foreground">No new requests</div>
                <p className="text-sm mt-1">You’ll see new commission requests here.</p>
              </div>
            ) : (
              <div className="divide-y rounded-md border">
                {incoming.items.map((c) => (
                  <div key={String(c._id)} className="px-4">
                    <CommissionRow c={c} />
                    {/* Actions: include accept/decline client buttons */}
                    <div className="pb-4">
                      <CommissionActions id={String(c._id)} status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="archive" className="mt-4">
            {archive.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-md border py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-3">
                  <ArchiveIcon className="h-6 w-6" />
                </div>
                <div className="font-medium text-foreground">No archived items</div>
                <p className="text-sm mt-1">Accept or decline requests to move them here.</p>
              </div>
            ) : (
              <div className="divide-y rounded-md border">
                {archive.map((c) => (
                  <div key={String(c._id)} className="px-4">
                    <CommissionRow c={c} />
                    {c.status === 'ACCEPTED' ? (
                      <div className="pb-4">
                        <CommissionActions id={String(c._id)} status={c.status} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Customer view
  const my = await listCustomerCommissions(session.user.id, 1, 20)
  return (
    <div className="container mx-auto max-w-3xl py-10">
      <RouteRefresher intervalMs={0} onMount onFocus onInterval={false} />
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Your commissions</h1>
        <RefreshHint intervalMs={0} />
      </div>
      <div className="h-4" />
      <Tabs defaultValue="my">
        <TabsList>
          <TabsTrigger value="my">
            My Requests
            {my.total > 0 ? <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-medium text-secondary-foreground">{my.total}</span> : null}
          </TabsTrigger>
          <TabsTrigger value="new">New Request</TabsTrigger>
        </TabsList>
        <TabsContent value="my" className="mt-4">
          {my.total === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border py-12 text-center text-muted-foreground">
              <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-3">
                <Inbox className="h-6 w-6" />
              </div>
              <div className="font-medium text-foreground">No requests yet</div>
              <p className="text-sm mt-1">Start a new commission to get the ball rolling.</p>
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {my.items.map((c) => (
                <div key={String(c._id)} className="px-4">
                  <CommissionRow c={c} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="new" className="mt-4">
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <div className="font-medium">Start a new commission</div>
              <p className="text-sm text-muted-foreground">Pick an artist and describe your idea.</p>
            </div>
            <Button asChild>
              <Link href="/commissions/new">New Request</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Client actions for artist: Accept/Decline
// Placed at bottom to keep file server by default
import NextDynamic from 'next/dynamic'
const CommissionActions = NextDynamic(() => import('./_components/CommissionActions'), { ssr: false })
