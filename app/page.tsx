// Home page (server component)
// - Renders marquee hero with recent artworks and live counts
// - Shows popular category chips
// - Presents an interactive "How it works" stepper (FeatureFlow)
// Data is fetched server-side to keep the landing fast and SEO-friendly.
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Palette, Sparkles, Users, BadgeCheck, Brush } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { listArtworks, getArtworksCollection } from "@/lib/db/artworks";
import { getUsersCollection } from "@/lib/db/users";
import { getCommissionsCollection } from "@/lib/db/commissions";
import { ArtMarquee } from "@/components/landing/art-marquee";
import { FeatureFlow } from "@/components/landing/feature-flow";

export const metadata: Metadata = {
  title: "Artify — Discover and Commission Custom Artwork",
  description: "Browse unique artwork or commission custom pieces from artists.",
};

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Recent artworks for the marquee
  const { items: recent } = await listArtworks({}, { page: 1, pageSize: 16, sort: "new" });
  const marquee = recent.map((a) => ({ src: a.imageUrl, alt: a.title }));

  // Lightweight counts for social proof
  const [artworksCount, artistsCount, commissionsCount] = await Promise.all([
    (await getArtworksCollection()).countDocuments({}),
    (await getUsersCollection()).countDocuments({ role: "ARTIST" }),
    (await getCommissionsCollection()).countDocuments({}),
  ]);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section with artwork marquee */}
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Discover Unique Artwork & Commission
                <span className="block bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  Custom Pieces
                </span>
              </h1>
              <p className="mx-auto max-w-[720px] text-muted-foreground md:text-lg">
                Connect with talented artists worldwide. Buy original artwork, or collaborate to bring your vision to life.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/explore">
                  Explore Artwork
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {session ? (
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Marquee */}
            {marquee.length ? (
              <ArtMarquee images={marquee} className="mt-6 w-full" />
            ) : null}

            {/* Stats */}
            <div className="mt-2 grid grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" />{artworksCount} artworks</div>
              <div className="flex items-center gap-2"><Brush className="h-4 w-4" />{artistsCount} artists</div>
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" />{commissionsCount} commissions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="w-full py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'All', href: '/explore' },
              { label: 'Paintings', href: '/explore?tags=painting' },
              { label: 'Digital Art', href: '/explore?tags=digital' },
              { label: 'Photography', href: '/explore?tags=photography' },
              { label: 'Sculptures', href: '/explore?tags=sculpture' },
            ].map((c) => (
              <Button key={c.label} asChild size="sm" variant="outline">
                <Link href={c.href}>{c.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Features / How it works */}
      <section className="w-full py-12 md:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">How it works</p>
            <h2 className="mt-1 text-2xl font-bold">From discovery to delivery</h2>
          </div>
          <FeatureFlow />
        </div>
      </section>
    </div>
  );
}
