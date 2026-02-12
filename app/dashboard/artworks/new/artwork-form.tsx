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
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Info } from 'lucide-react'

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
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Image URL</label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">How to get a direct image URL</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>You need the <strong>direct image URL</strong>, not the webpage URL:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Open the image in your browser</li>
                    <li>Right-click on the image</li>
                    <li>Select &quot;Copy image address&quot; or &quot;Copy image location&quot;</li>
                    <li>Paste that URL here</li>
                  </ol>
                  <p className="text-xs pt-1">✓ Correct: <code className="text-xs">https://images.example.com/photo.jpg</code></p>
                  <p className="text-xs">✗ Wrong: <code className="text-xs">https://example.com/photos/123</code></p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <Input 
          placeholder="https://example.com/image.jpg" 
          value={imageUrl} 
          onChange={(e) => setImageUrl(e.target.value)} 
          required 
        />
        {imageUrl ? (
          <Card className="mt-2 p-2">
            <div className="relative aspect-video w-full">
              <Image 
                src={imageUrl} 
                alt="Preview" 
                fill 
                className="object-cover rounded"
                onError={() => setError('Failed to load image. Please verify the URL is a direct link to an image file.')}
              />
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
