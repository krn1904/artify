"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { z } from 'zod'

type PresetArtist = { id: string; name: string }

export function CommissionRequestForm({ presetArtist }: { presetArtist?: PresetArtist }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [artistId, setArtistId] = useState(presetArtist?.id ?? '')
  const [artistName] = useState(presetArtist?.name ?? '')
  const [brief, setBrief] = useState('')
  const [budget, setBudget] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const Schema = z.object({
    artistId: z.string().trim().min(1, 'Artist is required'),
    brief: z.string().trim().min(10, 'Please provide a short brief (min 10 chars)').max(2000),
    budget: z
      .preprocess((v) => {
        if (v == null) return undefined
        if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
        if (typeof v === 'string') {
          const s = v.trim()
          if (s === '') return undefined
          const n = Number(s)
          return Number.isFinite(n) ? n : undefined
        }
        return undefined
      }, z.number().nonnegative())
      .optional(),
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    // Build payload and omit budget when empty so it remains truly optional
    const payloadRaw: Record<string, any> = { artistId, brief }
    if (typeof budget === 'string' ? budget.trim() !== '' : budget != null) {
      payloadRaw.budget = budget
    }
    const parsed = Schema.safeParse(payloadRaw)
    if (!parsed.success) {
      const flat = parsed.error.flatten()
      setError(Object.values(flat.fieldErrors).flat()[0] || 'Please fix the errors and try again')
      return
    }
    const payload = parsed.data
    try {
      const res = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.error || 'Failed to create commission'
        setError(typeof msg === 'string' ? msg : 'Failed to create commission')
        return
      }
      // Redirect to dashboard for now; later go to commission detail
      startTransition(() => router.push('/dashboard'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Artist</label>
        {presetArtist ? (
          <>
            <Input value={`${artistName}`} disabled readOnly />
            {/* Ensure artistId is submitted even when preset is shown */}
            <input type="hidden" value={artistId} />
          </>
        ) : (
          <Input
            placeholder="Artist ID"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            required
          />
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Brief</label>
        <Textarea
          placeholder="Describe what you'd like the artist to create..."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          required
          rows={6}
        />
        <p className="text-xs text-muted-foreground">Minimum 10 characters.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Budget (optional)</label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="e.g. 150"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          min={0}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      <div className="pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit request'}
        </Button>
      </div>
    </form>
  )
}
