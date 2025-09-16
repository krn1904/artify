"use client"

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Palette, User, Heart, ClipboardList, Brush, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Redirect to login after mount if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Fetch profile to get avatarUrl if missing in session
  useEffect(() => {
    async function loadProfile() {
      if (status !== "authenticated") return;
      try {
        const res = await fetch('/api/me/profile');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.user?.avatarUrl) setAvatarUrl(data.user.avatarUrl);
      } catch {}
    }
    loadProfile();
  }, [status]);

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'A';
  };

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  const isArtist = session.user.role === 'ARTIST';

  const actions = [
    {
      title: 'Edit Profile',
      href: '/dashboard/profile',
      icon: User,
      desc: 'Update your name, avatar, and bio.'
    },
    isArtist
      ? {
          title: 'Add Artwork',
          href: '/dashboard/artworks/new',
          icon: Brush,
          desc: 'Showcase a new piece in your portfolio.'
        }
      : {
          title: 'Explore Artwork',
          href: '/explore',
          icon: Palette,
          desc: 'Discover new pieces and styles you’ll love.'
        },
    {
      title: 'My Favorites',
      href: '/dashboard/favorites',
      icon: Heart,
      desc: 'See everything you’ve favorited in one place.'
    },
    {
      title: 'Commissions',
      href: '/commissions',
      icon: ClipboardList,
      desc: isArtist ? 'Review incoming requests and manage status.' : 'Track your requests or start a new one.'
    },
  ].filter(Boolean) as Array<{ title: string; href: string; icon: any; desc: string }>

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-transparent to-purple-500/5 p-6">
        <div className="relative z-10 flex items-start gap-4">
          <div className="rounded-full ring-1 ring-primary/20">
            {avatarUrl ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} alt={session.user.name || 'Profile'} />
                <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome, {session.user.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {isArtist ? 'Manage your portfolio and commission requests.' : 'Manage your profile, favorites, and commissions.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isArtist ? (
                <Button asChild size="sm">
                  <Link href="/dashboard/artworks/new">
                    Add artwork
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link href="/explore">
                    Explore artwork
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/commissions">Commissions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => (
            <Link key={a.href} href={a.href} className="group">
              <Card className="h-full overflow-hidden transition-colors hover:border-primary/40">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="rounded-md bg-muted p-2 text-foreground/80 group-hover:text-primary">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Tips</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="font-medium">Keep your profile fresh</div>
              <p className="text-sm text-muted-foreground mt-1">Add a short bio and avatar so collectors can get to know you.</p>
              <div className="mt-3">
                <Button asChild variant="outline" size="sm"><Link href="/dashboard/profile">Edit profile</Link></Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="font-medium">Use favorites to curate</div>
              <p className="text-sm text-muted-foreground mt-1">Tap the heart on pieces you love and revisit them here.</p>
              <div className="mt-3">
                <Button asChild variant="outline" size="sm"><Link href="/dashboard/favorites">My favorites</Link></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
