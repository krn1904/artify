import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from '@/lib/auth/authOptions'
import { getRequestById } from '@/lib/db/requests'
import { getUserById } from '@/lib/db/users'
import { listMessages } from '@/lib/db/messages'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import RequestActions from '../_components/RequestActions'
import { CommissionThread } from './commission-thread'
import { BidProposalButton } from './bid-proposal-button'

export const dynamic = 'force-dynamic'

type Status = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'

const STATUS_VARIANTS: Record<Status, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  REQUESTED: 'secondary',
  ACCEPTED: 'default',
  DECLINED: 'destructive',
  COMPLETED: 'outline',
}

function formatDate(value: Date | string) {
  const d = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

function formatDueDate(value?: Date | string | null) {
  if (!value) return null
  const match = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null
  const d = match
    ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    : value instanceof Date ? value : new Date(String(value))
  if (isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' }).format(d)
}

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const request = await getRequestById(id)
  return { title: request?.title ? `${request.title} | Artify` : 'Request | Artify' }
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const request = await getRequestById(id)
  if (!request) return notFound()

  const uid = session.user.id
  const isParty = String(request.artistId) === uid || String(request.customerId) === uid
  if (!isParty) return notFound()

  const isArtist = String(request.artistId) === uid
  const canChat = request.status === 'REQUESTED' || request.status === 'ACCEPTED'

  const [artistUser, customerUser, rawMessages] = await Promise.all([
    getUserById(String(request.artistId)),
    getUserById(String(request.customerId)),
    listMessages(id),
  ])

  const hasPendingBid = rawMessages.some(
    (m) => m.type === 'bid_proposal' && m.bidProposal?.status === 'pending'
  )

  const initialMessages = rawMessages.map((m) => ({
    id: String(m._id),
    senderId: String(m.senderId),
    type: m.type,
    body: m.body,
    bidProposal: m.bidProposal ?? null,
    readAt: m.readAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to requests
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{request.title || 'Untitled request'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isArtist
              ? `From ${customerUser?.name ?? 'Buyer'}`
              : `To ${artistUser?.name ?? 'Artist'}`}
            {' · '}
            {formatDate(request.createdAt)}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[request.status]}>{request.status}</Badge>
      </div>

      {/* Details card */}
      <div className="rounded-lg border bg-card p-5 space-y-4 mb-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Brief</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.brief}</p>
        </section>

        <Separator />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Budget</p>
            <p>{typeof request.budget === 'number' ? `$${request.budget.toLocaleString()}` : 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Due date</p>
            <p>{formatDueDate(request.dueDate) ?? 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
            <p className="capitalize">{request.status.toLowerCase()}</p>
          </div>
        </div>

        {request.referenceUrls && request.referenceUrls.length > 0 && (
          <>
            <Separator />
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Reference links
              </h2>
              <div className="space-y-2">
                {request.referenceUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline truncate"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    {url}
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Artist-only status actions */}
      {isArtist && (request.status === 'REQUESTED' || request.status === 'ACCEPTED') && (
        <div className="mb-6 rounded-lg border bg-muted/30 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-sm text-muted-foreground flex-1">
              {request.status === 'REQUESTED' ? 'Respond to this request:' : 'Ready to wrap up?'}
            </span>
            <RequestActions id={String(request._id)} status={request.status} />
          </div>
          <Separator />
          <div className="px-4 py-3">
            <BidProposalButton
              requestId={String(request._id)}
              hasPendingBid={hasPendingBid}
            />
          </div>
        </div>
      )}

      {/* Chat thread */}
      <div className="rounded-lg border">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">Messages</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {canChat
              ? `Chat with the ${isArtist ? 'buyer' : 'artist'} about this request.`
              : 'This request is closed — messages are read-only.'}
          </p>
        </div>
        <CommissionThread
          requestId={id}
          currentUserId={uid}
          initialMessages={initialMessages}
          canChat={canChat}
          currentUserName={session.user.name ?? 'You'}
          otherUserName={isArtist ? (customerUser?.name ?? 'Buyer') : (artistUser?.name ?? 'Artist')}
          isArtist={isArtist}
          currentBudget={request.budget ?? null}
        />
      </div>
    </div>
  )
}
