"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign } from 'lucide-react'

interface Props {
  requestId: string
  hasPendingBid: boolean
}

export function BidProposalButton({ requestId, hasPendingBid }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function submit() {
    const num = parseFloat(amount)
    if (!Number.isFinite(num) || num <= 0) {
      setError('Please enter a valid positive amount')
      return
    }
    setError(null)
    setPending(true)
    try {
      const res = await fetch(`/api/requests/${requestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bid_proposal', amount: num }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to submit proposal')
      setShowForm(false)
      setAmount('')
      startTransition(() => router.refresh())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit proposal')
    } finally {
      setPending(false)
    }
  }

  if (hasPendingBid) {
    return (
      <span className="text-xs text-muted-foreground italic">
        Awaiting buyer response on budget proposal
      </span>
    )
  }

  if (showForm) {
    return (
      <div className="rounded-lg border bg-background p-3 space-y-2 w-full">
        <p className="text-xs font-medium">Propose a new budget</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            className="h-8 text-sm"
            disabled={pending}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setShowForm(false); setAmount(''); setError(null) }}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={pending}>
            {pending ? 'Sending…' : 'Send proposal'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setShowForm(true)}
      className="gap-1.5"
    >
      <DollarSign className="h-4 w-4" />
      Propose budget
    </Button>
  )
}
