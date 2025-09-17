"use client"

import Link from "next/link"
import { useRef } from "react"
import { ArrowRight, Palette, Sparkles, Users } from "lucide-react"

type Step = {
  eyebrow: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
}

const STEPS: Step[] = [
  {
    eyebrow: "Discover",
    title: "Browse Curated Artwork",
    description: "Handpicked pieces across styles and mediums—updated weekly.",
    href: "/explore",
    icon: <Palette className="h-5 w-5" />,
  },
  {
    eyebrow: "Collaborate",
    title: "Request a Commission",
    description: "Share a brief and budget to work one‑on‑one with an artist.",
    href: "/commissions",
    icon: <Users className="h-5 w-5" />,
  },
  {
    eyebrow: "Deliver",
    title: "Track to Completion",
    description: "Follow progress from concept to delivery with clear updates.",
    href: "/commissions",
    icon: <Sparkles className="h-5 w-5" />,
  },
]

export function FeatureFlow() {
  return (
    <div className="relative">
      {/* dashed connector (lg+) */}
      <div className="pointer-events-none absolute inset-x-8 top-20 hidden lg:block">
        <div className="mx-auto max-w-7xl h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, idx) => (
          <SpotlightCard key={s.title} index={idx + 1} step={s} />
        ))}
      </div>
    </div>
  )}

function SpotlightCard({ index, step }: { index: number; step: Step }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty("--x", `${x}px`)
    el.style.setProperty("--y", `${y}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-primary/25 to-transparent"
    >
      <div className="relative h-full rounded-2xl bg-background p-6 ring-1 ring-border/60 overflow-hidden">
        {/* interactive spotlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(350px circle at var(--x) var(--y), rgba(99,102,241,0.15), transparent 45%)",
          }}
        />

        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            {step.icon}
          </div>
          <span className="text-xs font-medium text-muted-foreground">Step {index} · {step.eyebrow}</span>
        </div>

        <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>

        <Link href={step.href} className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline">
          Learn more
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>

        {/* decorative corner gradient */}
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      </div>
    </div>
  )
}

