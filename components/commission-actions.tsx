"use client"

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type Status = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'

export function CommissionActions({ id, status }: { id: string; status?: Status }) {
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

  if (status === 'ACCEPTED') {
    return (
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={isPending}>Mark as completed</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark as completed?</AlertDialogTitle>
              <AlertDialogDescription>
                This will move the commission to Completed. You can’t change it back.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setStatus('COMPLETED' as any)}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {err ? <span className="text-xs text-red-600 ml-2">{err}</span> : null}
      </div>
    )
  }

  if (status && status !== 'REQUESTED') return null

  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" disabled={isPending}>Accept</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept this request?</AlertDialogTitle>
            <AlertDialogDescription>
              The requester will see this as Accepted. You can mark it as completed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setStatus('ACCEPTED')}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={isPending}>Decline</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this request?</AlertDialogTitle>
            <AlertDialogDescription>
              The requester will see this as Declined. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setStatus('DECLINED')}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {err ? <span className="text-xs text-red-600 ml-2">{err}</span> : null}
    </div>
  )
}

export default CommissionActions
