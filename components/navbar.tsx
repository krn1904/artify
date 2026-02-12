"use client"

import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import { Menu, Palette } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [avatarUrl, setAvatarUrl] = useState<string>("")

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  function linkClass(href: string): string {
    const base = "relative text-sm font-medium transition-colors hover:text-primary"
    if (isActive(href)) {
      return (
        base +
        " text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
      )
    }
    return base
  }

  function getInitials(name?: string | null) {
    if (!name) return 'A'
    const parts = String(name).trim().split(/\s+/)
    const first = parts[0]?.[0] ?? ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return (first + last).toUpperCase() || 'A'
  }

  useEffect(() => {
    let active = true
    async function load() {
      if (!session) return
      try {
        const res = await fetch('/api/me/profile')
        if (!res.ok) return
        const data = await res.json()
        if (active && data?.user?.avatarUrl) setAvatarUrl(data.user.avatarUrl)
      } catch {}
    }
    load()
    return () => {
      active = false
    }
  }, [session])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <Palette className="h-6 w-6" />
              <span className="font-bold">Artify</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/explore" className={linkClass("/explore")}>
                Explore
              </Link>
              <Link href="/artists" className={linkClass("/artists")}>
                Artists
              </Link>
              <Link href="/commissions" className={linkClass("/commissions")}>
                Commissions
              </Link>
              {session?.user?.role === 'ARTIST' ? (
                <Button asChild size="sm">
                  <Link href="/dashboard/artworks/new">Add artwork</Link>
                </Button>
              ) : null}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            
            {/* Desktop Account */}
            <div className="hidden md:flex items-center space-x-4">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-2 rounded-full ring-1 ring-border px-2 py-1 hover:bg-muted/50">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={avatarUrl} alt={session.user.name || 'Account'} />
                        <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm max-w-[120px] truncate">{session.user.name}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/artist/${session.user.id}`}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/favorites" prefetch={false}>My favorites</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/commissions">Commissions</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4 mt-6">
                  <Link href="/explore" className={linkClass("/explore")}>
                    Explore
                  </Link>
                  <Link href="/artists" className={linkClass("/artists")}>
                    Artists
                  </Link>
                  <Link href="/commissions" className={linkClass("/commissions")}>
                    Commissions
                  </Link>
                  {session ? (
                    <>
                      <div className="h-px bg-border my-2" />
                      <Link href="/dashboard" className={linkClass("/dashboard")}>
                        Dashboard
                      </Link>
                      <Link href={`/artist/${session.user.id}`} className={linkClass(`/artist/${session.user.id}`)}>
                        Profile
                      </Link>
                      <Link href="/dashboard/favorites" className={linkClass("/dashboard/favorites")}>
                        My favorites
                      </Link>
                      <Link href="/commissions" className={linkClass("/commissions")}>
                        Commissions
                      </Link>
                    </>
                  ) : null}
                  {session?.user?.role === 'ARTIST' ? (
                    <Button asChild>
                      <Link href="/dashboard/artworks/new">Add artwork</Link>
                    </Button>
                  ) : null}
                  
                  {session ? (
                    <Button variant="outline" className="w-full" onClick={() => signOut({ callbackUrl: '/' })}>
                      Logout
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
