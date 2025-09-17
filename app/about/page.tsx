export const metadata = {
  title: 'About | Artify',
  description: 'What Artify is, why we built it, and how it works.'
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Users, Sparkles, Brush } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-12 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">About Artify</h1>
        <p className="text-muted-foreground md:text-lg">
          Artify is a simple marketplace to discover original artwork and collaborate directly with artists on custom commissions.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Our Mission</h2>
        <p className="text-muted-foreground">
          We believe owning original art should be accessible and enjoyable for everyone. Artify connects collectors and creators with a lightweight, transparent process that focuses on great work—not complexity.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl border p-6 bg-background">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(30rem_18rem_at_top,theme(colors.primary/10),transparent)]" />
          <div className="relative">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20"><Sparkles className="h-5 w-5" /></div>
            <h3 className="font-semibold mb-1">Discover</h3>
            <p className="text-sm text-muted-foreground">Browse a curated selection of paintings, digital art, photography, and more.</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-xl border p-6 bg-background">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(30rem_18rem_at_top,theme(colors.primary/10),transparent)]" />
          <div className="relative">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20"><Users className="h-5 w-5" /></div>
            <h3 className="font-semibold mb-1">Connect</h3>
            <p className="text-sm text-muted-foreground">Message artists and request commissions with your brief, budget, and timeline.</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-xl border p-6 bg-background">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(30rem_18rem_at_top,theme(colors.primary/10),transparent)]" />
          <div className="relative">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20"><Brush className="h-5 w-5" /></div>
            <h3 className="font-semibold mb-1">Create</h3>
            <p className="text-sm text-muted-foreground">Follow progress from concept to completion and showcase finished pieces.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">For Artists</h2>
        <ul className="space-y-2 text-muted-foreground">
          {["Share your portfolio with simple, URL‑based uploads.","Receive commission requests with clear briefs and expectations.","Manage requests and communicate status from one place."].map((t) => (
            <li key={t} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /><span>{t}</span></li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">For Collectors</h2>
        <ul className="space-y-2 text-muted-foreground">
          {["Explore curated work and discover new artists and styles.","Commission custom pieces tailored to your space and story.","Track progress and keep everything organized in your dashboard."].map((t) => (
            <li key={t} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /><span>{t}</span></li>
          ))}
        </ul>
      </section>

      <div className="pt-2">
        <Button asChild>
          <Link href="/explore">Start Exploring</Link>
        </Button>
      </div>

      <div className="pt-2">
        <Button asChild variant="outline">
          <Link href="/about/faq">Read our FAQ</Link>
        </Button>
      </div>
    </div>
  )
}
