"use client"

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { RequestCreateSchema } from '@/lib/schemas/request'

type PresetArtist = { id: string; name: string }
type PresetArtwork = {
  id: string
  title: string
  imageUrl: string
  price: number
  url: string
}

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ArtworkRequestForm({
  presetArtist,
  presetArtwork,
  viewerId,
}: {
  presetArtist?: PresetArtist
  presetArtwork?: PresetArtwork
  viewerId?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [artistId, setArtistId] = useState(presetArtist?.id ?? '')
  const [artistName, setArtistName] = useState(presetArtist?.name ?? '')
  const [brief, setBrief] = useState('')
  const [budget, setBudget] = useState<string>('')
  const [title, setTitle] = useState(
    presetArtwork ? `Custom artwork inspired by ${presetArtwork.title}` : ''
  )
  const [referenceText, setReferenceText] = useState(presetArtwork?.url ?? '') // one URL per line
  const [dueDate, setDueDate] = useState('') // yyyy-mm-dd
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; avatarUrl: string | null }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const Schema = RequestCreateSchema
  const minDueDate = formatDateInput(new Date())

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
    if (!presetArtist && !artistId) {
      setError('Please select an artist from the suggestions')
      return
    }
    if (viewerId && artistId && viewerId === artistId) {
      setError("You cannot create a request for yourself")
      return
    }
    // Build payload for validation and submission
    const payloadRaw: Record<string, any> = { artistId, brief }
    if (title.trim()) payloadRaw.title = title
    payloadRaw.budget = budget
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
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.error || 'Failed to create request'
        setError(typeof msg === 'string' ? msg : 'Failed to create request')
        return
      }
      // Notify and redirect to the requests hub
      toast({ title: 'Request sent', description: 'We\'ve notified the artist.' })
      startTransition(() => router.push('/requests'))
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
            You cannot create a request from your own artist profile.
          </AlertDescription>
        </Alert>
      ) : null}
      {presetArtwork ? (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
              <Image
                src={presetArtwork.imageUrl}
                alt={presetArtwork.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Based on artwork</div>
              <div className="truncate text-sm text-foreground">{presetArtwork.title}</div>
              <div className="text-xs text-muted-foreground">Listed at ${presetArtwork.price}</div>
              <div className="text-xs text-muted-foreground">
                We pre-filled the artist and added this artwork as a reference link.
              </div>
              <div className="mt-2">
                <Link href={`/artwork/${presetArtwork.id}`} className="text-xs underline">
                  View artwork details
                </Link>
              </div>
            </div>
          </div>
        </Card>
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
                const nextQuery = e.target.value
                setQuery(nextQuery)
                setError(null)
                if (artistId && nextQuery !== artistName) {
                  setArtistId('')
                  setArtistName('')
                }
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
          placeholder="Short title for your custom artwork request"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Brief</label>
        <Textarea
          placeholder="Describe the custom artwork you'd like the artist to create..."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          required
          rows={6}
        />
        <p className="text-xs text-muted-foreground">Minimum 10 characters.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Budget</label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="e.g. 150"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          min={0}
          required
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
          min={minDueDate}
        />
        <p className="text-xs text-muted-foreground">You can select today or any future date.</p>
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
