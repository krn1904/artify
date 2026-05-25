"use client"

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, DollarSign, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type BidProposalStatus = 'pending' | 'accepted' | 'declined'

type BidProposal = {
  amount: number
  status: BidProposalStatus
}

type Message = {
  id: string
  senderId: string
  type: 'text' | 'bid_proposal'
  body: string
  bidProposal?: BidProposal | null
  readAt: string | null
  createdAt: string
}

interface Props {
  requestId: string
  currentUserId: string
  initialMessages: Message[]
  canChat: boolean
  currentUserName: string
  otherUserName: string
  isArtist: boolean
  currentBudget: number | null
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export function CommissionThread({
  requestId,
  currentUserId,
  initialMessages,
  canChat,
  currentUserName,
  otherUserName,
  isArtist,
  currentBudget,
}: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 8 seconds
  useEffect(() => {
    if (!canChat) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/requests/${requestId}/messages`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages ?? [])
        }
      } catch {}
    }, 8000)
    return () => clearInterval(interval)
  }, [requestId, canChat])

  async function sendMessage() {
    const body = draft.trim()
    if (!body || isPending) return
    setError(null)
    setDraft('')

    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      senderId: currentUserId,
      type: 'text',
      body,
      bidProposal: null,
      readAt: null,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const res = await fetch(`/api/requests/${requestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to send')
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? data.message : m)))
      startTransition(() => router.refresh())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send')
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setDraft(body)
    }
  }

  async function respondToBid(msgId: string, action: 'accepted' | 'declined') {
    setError(null)
    try {
      const res = await fetch(`/api/requests/${requestId}/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to respond')
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.bidProposal
            ? { ...m, bidProposal: { ...m.bidProposal, status: action } }
            : m
        )
      )
      startTransition(() => router.refresh())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to respond to bid')
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col">
      <ScrollArea className="h-[380px] px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-muted-foreground">
            No messages yet.{canChat ? ' Start the conversation below.' : ''}
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messages.map((m) => {
              const isMine = m.senderId === currentUserId
              const senderName = isMine ? currentUserName : otherUserName

              if (m.type === 'bid_proposal' && m.bidProposal) {
                const bp = m.bidProposal
                const cardClass =
                  bp.status === 'accepted'
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                    : bp.status === 'declined'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                    : 'border bg-card'
                const badgeVariant =
                  bp.status === 'accepted' ? 'default' : bp.status === 'declined' ? 'destructive' : 'secondary'
                return (
                  <div key={m.id} className="flex justify-center py-1">
                    <div className={`rounded-xl w-full max-w-xs p-4 space-y-3 ${cardClass}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Budget Proposal
                          </span>
                        </div>
                        <Badge variant={badgeVariant} className="capitalize text-[10px] px-1.5 py-0">
                          {bp.status}
                        </Badge>
                      </div>
                      <div className="text-center py-1">
                        <p className="text-3xl font-bold tracking-tight">${bp.amount.toLocaleString()}</p>
                        {currentBudget != null && bp.status === 'pending' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Current: ${currentBudget.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <p className="text-[11px] text-center text-muted-foreground">{formatTime(m.createdAt)}</p>
                      {!isArtist && bp.status === 'pending' && canChat && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-950/50"
                            onClick={() => respondToBid(m.id, 'declined')}
                          >
                            <X className="h-3.5 w-3.5" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => respondToBid(m.id, 'accepted')}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Accept
                          </Button>
                        </div>
                      )}
                      {bp.status === 'accepted' && (
                        <p className="text-xs text-center text-green-700 dark:text-green-400 font-medium">
                          Budget updated to this amount
                        </p>
                      )}
                      {bp.status === 'declined' && (
                        <p className="text-xs text-center text-red-600 dark:text-red-400 font-medium">
                          Proposal was declined
                        </p>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <div key={m.id} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarFallback className="text-[11px]">{initials(senderName)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted text-foreground rounded-tl-sm'
                      }`}
                    >
                      {m.body}
                    </div>
                    <span className="text-[11px] text-muted-foreground px-1">{formatTime(m.createdAt)}</span>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {canChat ? (
        <div className="border-t px-4 py-3 space-y-2">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 items-end">
            <Textarea
              placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              className="resize-none flex-1"
              disabled={isPending}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={isPending || !draft.trim()}
              className="shrink-0 h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">Enter to send &bull; Shift+Enter for new line</p>
        </div>
      ) : (
        <div className="border-t px-5 py-3 text-sm text-muted-foreground">
          This request is closed — no new messages can be sent.
        </div>
      )}
    </div>
  )
}
