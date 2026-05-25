"use client"

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send } from 'lucide-react'

type Message = {
  id: string
  senderId: string
  body: string
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
      body,
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
              return (
                <div key={m.id} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarFallback className="text-[11px]">{initials(senderName)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
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
        <div className="border-t px-4 py-3">
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
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
          <p className="text-[11px] text-muted-foreground mt-1.5">Enter to send &bull; Shift+Enter for new line</p>
        </div>
      ) : (
        <div className="border-t px-5 py-3 text-sm text-muted-foreground">
          This request is closed — no new messages can be sent.
        </div>
      )}
    </div>
  )
}
