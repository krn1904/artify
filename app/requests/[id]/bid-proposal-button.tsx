"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Clock } from 'lucide-react'

interface Props {
  requestId: string
  hasPendingBid: boolean
}

export function BidProposalButton({ requestId, hasPendingBid }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function cancel() {
    setShowForm(false)
    setAmount('')
    setError(null)
  }

  async function submit() {
    const num = parseFloat(amount)
    if (!Number.isFinite(num) || num <= 0) {
      setError('Please enter a valid positive amount')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/requests/${requestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bid_proposal', amount: num }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to submit proposal')
      cancel()
      startTransition(() => router.refresh())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit proposal')
    } finally {
      setSubmitting(false)
    }
  }

  if (hasPendingBid) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Budget proposal sent</p>
          <p className="text-xs text-muted-foreground mt-0.5">Waiting for the buyer to respond.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-amber-700 dark:text-amber-400">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="text-xs font-medium whitespace-nowrap">Pending</span>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Suggest a budget adjustment</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The buyer will see this in the chat and can accept or decline.
          </p>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground select-none">
            $
          </span>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            className="pl-7"
            disabled={submitting}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={cancel} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" className="flex-1" onClick={submit} disabled={submitting}>
            {submitting ? 'Sending…' : 'Send to buyer'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-muted-foreground">Suggest budget adjustment</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Propose a revised amount after discussing requirements.
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="shrink-0 gap-2">
        <DollarSign className="h-3.5 w-3.5" />
        Propose
      </Button>
    </div>
  )
}
