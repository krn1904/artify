"use client"

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'

type PresetArtist = { id: string; name: string }

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function CommissionRequestForm({ presetArtist, viewerId }: { presetArtist?: PresetArtist, viewerId?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [artistId, setArtistId] = useState(presetArtist?.id ?? '')
  const [artistName, setArtistName] = useState(presetArtist?.name ?? '')
  const [brief, setBrief] = useState('')
  const [budget, setBudget] = useState<string>('')
  const [title, setTitle] = useState('')
  const [referenceText, setReferenceText] = useState('') // one URL per line
  const [dueDate, setDueDate] = useState('') // yyyy-mm-dd
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; avatarUrl: string | null }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const Schema = z.object({
    artistId: z.string().trim().min(1, 'Artist is required'),
    title: z.string().trim().min(3, 'Title too short').max(120).optional().or(z.literal('')),
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
    referenceUrls: z
      .preprocess((v) => {
        if (v == null) return undefined
        if (typeof v === 'string') {
          const lines = v
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean)
          return lines
        }
        return v
      }, z.array(z.string().url()).max(10))
      .optional(),
    dueDate: z
      .preprocess((v) => {
        if (v == null || v === '') return undefined
        if (typeof v === 'string') {
          const d = new Date(v)
          return Number.isNaN(d.getTime()) ? undefined : d
        }
        return v
      }, z.date())
      .optional(),
  })

  // Debounced artist suggestions
  useEffect(() => {
    let active = true
    if (!presetArtist && query.trim().length >= 2) {
      const t = setTimeout(async () => {
        try {
          const res = await fetch(`/api/artists?q=${encodeURIComponent(query.trim())}&limit=8`)
          const data = await res.json()
          if (active) setSuggestions(Array.isArray(data.items) ? data.items : [])
        } catch {
          if (active) setSuggestions([])
        }
      }, 300)
      return () => {
        active = false
        clearTimeout(t)
      }
    } else {
      setSuggestions([])
    }
  }, [query, presetArtist])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (viewerId && artistId && viewerId === artistId) {
      setError("You cannot request a commission from yourself")
      return
    }
    // Build payload and omit budget when empty so it remains truly optional
    const payloadRaw: Record<string, any> = { artistId, brief }
    if (title.trim()) payloadRaw.title = title
    if (typeof budget === 'string' ? budget.trim() !== '' : budget != null) {
      payloadRaw.budget = budget
    }
    if (referenceText.trim()) payloadRaw.referenceUrls = referenceText
    if (dueDate) payloadRaw.dueDate = dueDate
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
      // Notify and redirect to the commissions hub
      toast({ title: 'Request sent', description: 'We\'ve notified the artist.' })
      startTransition(() => router.push('/commissions'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {viewerId && presetArtist && presetArtist.id === viewerId ? (
        <Alert variant="destructive">
          <AlertTitle>Action not allowed</AlertTitle>
          <AlertDescription>
            You cannot request a commission from your own artist profile.
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-2">
        <label className="text-sm font-medium">Artist</label>
        {presetArtist ? (
          <>
            <Input value={`${artistName}`} disabled readOnly />
            {/* Ensure artistId is submitted even when preset is shown */}
            <input type="hidden" value={artistId} />
          </>
        ) : (
          <div className="relative">
            <Input
              placeholder="Search artist by name..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute z-10 mt-1 w-full max-h-64 overflow-auto">
                <ul>
                  {suggestions.map((s) => (
                    <li
                      key={s.id}
                      className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-3"
                      onMouseDown={() => {
                        if (viewerId && s.id === viewerId) {
                          setError('You cannot select yourself')
                          return
                        }
                        setArtistId(s.id)
                        setArtistName(s.name)
                        setQuery(s.name)
                        setShowSuggestions(false)
                      }}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={s.avatarUrl || ''} alt={s.name} />
                        <AvatarFallback>{(s.name?.[0] || 'A').toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{s.name}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {/* Keep selected artist id in hidden field to ensure submission */}
            <input type="hidden" value={artistId} />
            {artistId && artistName && (
              <div className="mt-2 text-xs text-muted-foreground">Selected artist: <span className="font-medium text-foreground">{artistName}</span></div>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Title (optional)</label>
        <Input
          placeholder="Short title for your commission"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
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
      <div className="space-y-2">
        <label className="text-sm font-medium">Reference URLs (optional)</label>
        <Textarea
          placeholder="Paste one URL per line"
          value={referenceText}
          onChange={(e) => setReferenceText(e.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">Up to 10 links. One per line.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Due date (optional)</label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      <div className="pt-2">
        <Button type="submit" disabled={isPending || (viewerId !== undefined && viewerId === artistId)}>
          {isPending ? 'Submitting…' : 'Submit request'}
        </Button>
      </div>
    </form>
  )
}
