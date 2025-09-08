"use client"

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function CommissionActions({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  async function setStatus(status: 'ACCEPTED' | 'DECLINED') {
    setErr(null)
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to update')
      }
      startTransition(() => router.refresh())
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to update')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" disabled={isPending} onClick={() => setStatus('ACCEPTED')}>Accept</Button>
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => setStatus('DECLINED')}>Decline</Button>
      {err ? <span className="text-xs text-red-600 ml-2">{err}</span> : null}
    </div>
  )
}

export default CommissionActions
