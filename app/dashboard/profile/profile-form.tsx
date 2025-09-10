"use client"

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type Props = {
  initial: {
    name: string
    email: string
    avatarUrl: string
    bio: string
    role: 'CUSTOMER' | 'ARTIST'
  }
}

export default function ProfileForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(initial.name)
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl)
  const [bio, setBio] = useState(initial.bio)
  const [role] = useState<'CUSTOMER' | 'ARTIST'>(initial.role)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Role changes are restricted for now; omit `role` from the payload
        body: JSON.stringify({ name, avatarUrl, bio }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to update profile')
      toast({ title: 'Profile updated' })
      startTransition(() => window.location.reload())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input value={initial.email} disabled readOnly />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Avatar URL</label>
        <Input placeholder="https://..." value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Bio</label>
        <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Role</label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Role changes are temporarily disabled and will be available soon.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <select
          className="h-10 rounded-md border bg-muted px-3 text-sm text-muted-foreground"
          value={role}
          disabled
        >
          <option value="CUSTOMER">Customer</option>
          <option value="ARTIST">Artist</option>
        </select>
        {/* Intentionally no helper text; see tooltip for details. */}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="pt-2">
        <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </form>
  )
}
