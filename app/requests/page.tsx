import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { listArtistRequests, listCustomerRequests, type RequestDoc } from '@/lib/db/requests'
import { getUserById } from '@/lib/db/users'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Inbox, Archive as ArchiveIcon } from 'lucide-react'
import RouteRefresher from '@/components/shared/route-refresher'
import RefreshHint from '@/components/shared/refresh-hint'
import SellerRequestDetailsDialog from './_components/SellerRequestDetailsDialog'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Requests | Artify',
  description: 'Start a custom artwork request or review existing requests.',
}

function StatusBadge({ status }: { status: RequestDoc['status'] }) {
  const map: Record<RequestDoc['status'], string> = {
    REQUESTED: 'secondary',
    ACCEPTED: 'default',
    DECLINED: 'destructive',
    COMPLETED: 'outline',
  }
  return <Badge variant={map[status] as any}>{status}</Badge>
}

function RequestRow({ c }: { c: RequestDoc }) {
  const date = new Date(c.createdAt).toLocaleDateString()
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div>
        <div className="font-medium">{c.title || 'Untitled request'}</div>
        <div className="text-sm text-muted-foreground">{date}</div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={c.status} />
      </div>
    </div>
  )
}

async function attachCustomerNames(requests: RequestDoc[]) {
  const customerIds = Array.from(new Set(requests.map((request) => String(request.customerId))))
  const customers = await Promise.all(
    customerIds.map(async (customerId) => [customerId, await getUserById(customerId)] as const)
  )
  const customerNameMap = new Map(
    customers.map(([customerId, customer]) => [customerId, customer?.name || 'Unknown buyer'])
  )

  return requests.map((request) => ({
    ...request,
    customerName: customerNameMap.get(String(request.customerId)) || 'Unknown buyer',
  }))
}

export default async function RequestsHubPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    // Guests see a simple explainer and CTAs.
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <h1 className="text-3xl font-bold mb-2">Requests</h1>
        <p className="text-muted-foreground mb-8">
          Work with your favorite artists on custom pieces. Log in to start a new request
          or browse artists to find the right fit.
        </p>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login?callbackUrl=%2Frequests">Log in to start</Link>
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
    const incoming = await listArtistRequests(session.user.id, 'REQUESTED', 1, 20)
    const archiveAll = await listArtistRequests(session.user.id, undefined, 1, 20)
    const archive = archiveAll.items.filter((c) => c.status !== 'REQUESTED')
    const allRequests = await attachCustomerNames([...incoming.items, ...archive])
    const incomingWithCustomerNames = allRequests.filter((c) => c.status === 'REQUESTED')
    const archiveWithCustomerNames = allRequests.filter((c) => c.status !== 'REQUESTED')

    return (
      <div className="container mx-auto max-w-3xl py-10">
        <RouteRefresher intervalMs={15000} onMount onFocus onInterval />
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Incoming requests</h1>
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
                <p className="text-sm mt-1">You’ll see new requests here.</p>
              </div>
            ) : (
              <div className="divide-y rounded-md border">
                {incomingWithCustomerNames.map((c) => (
                  <SellerRequestDetailsDialog
                    key={String(c._id)}
                    request={{
                      id: String(c._id),
                      title: c.title,
                      brief: c.brief,
                      budget: c.budget,
                      referenceUrls: c.referenceUrls,
                      dueDate: c.dueDate?.toISOString() ?? null,
                      status: c.status,
                      createdAt: c.createdAt.toISOString(),
                      updatedAt: c.updatedAt.toISOString(),
                      customerName: c.customerName,
                    }}
                  />
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
                {archiveWithCustomerNames.map((c) => (
                  <SellerRequestDetailsDialog
                    key={String(c._id)}
                    request={{
                      id: String(c._id),
                      title: c.title,
                      brief: c.brief,
                      budget: c.budget,
                      referenceUrls: c.referenceUrls,
                      dueDate: c.dueDate?.toISOString() ?? null,
                      status: c.status,
                      createdAt: c.createdAt.toISOString(),
                      updatedAt: c.updatedAt.toISOString(),
                      customerName: c.customerName,
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Customer view
  const my = await listCustomerRequests(session.user.id, 1, 20)
  return (
    <div className="container mx-auto max-w-3xl py-10">
      <RouteRefresher intervalMs={0} onMount onFocus onInterval={false} />
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Your requests</h1>
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
              <p className="text-sm mt-1">Start a new request to get the ball rolling.</p>
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {my.items.map((c) => (
                <Link key={String(c._id)} href={`/requests/${String(c._id)}`} className="block px-4 hover:bg-muted/40 transition-colors">
                  <RequestRow c={c} />
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="new" className="mt-4">
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <div className="font-medium">Start a new request</div>
              <p className="text-sm text-muted-foreground">Pick an artist and describe your idea.</p>
            </div>
            <Button asChild>
              <Link href="/requests/new">New Request</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
