"use client"

import { useState, useTransition } from 'react'
import { ArtworkCreateFormSchema as Schema } from '@/lib/schemas/artwork'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { toast } from '@/hooks/use-toast'

// Using shared form schema from lib/schemas

export function ArtworkForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = Schema.safeParse({ title, imageUrl, price, description, tags })
    if (!parsed.success) {
      const flat = parsed.error.flatten()
      setError(Object.values(flat.fieldErrors).flat()[0] || 'Please fix the errors and try again')
      return
    }
    try {
      const res = await fetch('/api/my/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create artwork')
      }
      toast({ title: 'Artwork added', description: 'Your artwork is now live.' })
      startTransition(() => router.push('/explore?my=1'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Image URL</label>
        <Input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        {imageUrl ? (
          <Card className="mt-2 p-2">
            <div className="relative aspect-video w-full">
              {/* Basic preview; relies on remote URL */}
              <Image src={imageUrl} alt="Preview" fill className="object-cover rounded" />
            </div>
          </Card>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Price (USD)</label>
        <Input type="number" inputMode="decimal" min={0} value={price} onChange={(e) => setPrice(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description (optional)</label>
        <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tags (comma-separated, up to 5)</label>
        <Input placeholder="e.g. landscape, oil, portrait" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="pt-2">
        <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Save artwork'}</Button>
      </div>
    </form>
  )
}
