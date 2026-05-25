"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import RequestActions from './RequestActions'

type Status = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'

type SellerRequestDetails = {
  id: string
  title?: string | null
  brief: string
  budget?: number | null
  referenceUrls?: string[]
  dueDate?: string | Date | null
  status: Status
  createdAt: string | Date
  updatedAt: string | Date
  customerName?: string | null
}

function formatDate(value?: string | Date | null) {
  if (!value) return 'Not provided'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not provided'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatDueDate(value?: string | Date | null) {
  if (!value) return 'Not provided'
  let date: Date
  if (value instanceof Date) {
    date = value
  } else {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (!match) return 'Not provided'
    date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  }
  if (Number.isNaN(date.getTime())) return 'Not provided'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(date)
}

function formatBudget(value?: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Not provided'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, 'secondary' | 'default' | 'destructive' | 'outline'> = {
    REQUESTED: 'secondary',
    ACCEPTED: 'default',
    DECLINED: 'destructive',
    COMPLETED: 'outline',
  }

  return <Badge variant={map[status]}>{status}</Badge>
}

function DetailBlock({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  )
}

export default function SellerRequestDetailsDialog({
  request,
}: {
  request: SellerRequestDetails
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-muted/40"
        >
          <div className="min-w-0 flex-1">
            <div className="font-medium">{request.title || 'Untitled request'}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              From {request.customerName || 'Buyer'} • {formatDate(request.createdAt)}
            </div>
            <div className="mt-2 truncate text-sm text-muted-foreground">{request.brief}</div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <StatusBadge status={request.status} />
            <span className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium">
              View details
            </span>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto p-0">
        <div className="border-b pl-6 pr-14 py-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle>{request.title || 'Untitled request'}</DialogTitle>
                <DialogDescription>
                  Review the buyer’s full request and respond from this view.
                </DialogDescription>
              </DialogHeader>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailBlock label="Buyer" value={request.customerName || 'Unknown buyer'} />
            <DetailBlock label="Budget" value={formatBudget(request.budget)} />
            <DetailBlock label="Requested on" value={formatDate(request.createdAt)} />
            <DetailBlock label="Due date" value={formatDueDate(request.dueDate)} />
            <DetailBlock label="Last updated" value={formatDate(request.updatedAt)} />
            <DetailBlock label="Status" value={request.status} />
          </div>
        </div>

        <div className="space-y-6 px-6 py-5">
          <section>
            <h3 className="text-sm font-semibold">Request brief</h3>
            <div className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/20 p-4 text-sm leading-6">
              {request.brief}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold">Reference links</h3>
            {request.referenceUrls && request.referenceUrls.length > 0 ? (
              <div className="mt-2 space-y-2">
                {request.referenceUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm text-primary transition hover:bg-muted/30"
                  >
                    <span className="truncate">{url}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No reference links were provided.</p>
            )}
          </section>

          {request.status === 'DECLINED' || request.status === 'COMPLETED' ? (
            <section>
              <h3 className="text-sm font-semibold">Request status</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This request is already {request.status.toLowerCase()} and can no longer be changed.
              </p>
            </section>
          ) : null}
        </div>

        <DialogFooter className="border-t px-6 py-4 flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/requests/${request.id}`} onClick={() => setOpen(false)}>
              <MessageSquare className="h-4 w-4" />
              View messages
            </Link>
          </Button>
          {request.status === 'REQUESTED' || request.status === 'ACCEPTED' ? (
            <RequestActions
              id={request.id}
              status={request.status}
              onSuccess={() => setOpen(false)}
            />
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
