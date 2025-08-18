"use client"

import type { JSX } from 'react'
import { Menu, Palette } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session } = useSession()

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
              <Link href="/explore" className="text-sm font-medium transition-colors hover:text-primary">
                Explore
              </Link>
              <Link href="/artists" className="text-sm font-medium transition-colors hover:text-primary">
                Artists
              </Link>
              <Link href="/commissions" className="text-sm font-medium transition-colors hover:text-primary">
                Commissions
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {session ? (
                <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
                  Logout
                </Button>
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
                  <Link href="/explore" className="text-sm font-medium transition-colors hover:text-primary">
                    Explore
                  </Link>
                  <Link href="/artists" className="text-sm font-medium transition-colors hover:text-primary">
                    Artists
                  </Link>
                  <Link href="/commissions" className="text-sm font-medium transition-colors hover:text-primary">
                    Commissions
                  </Link>
                  <Button variant="outline" asChild className="w-full">
                    {session ? (
                      <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
                        Logout
                      </Button>
                    ) : (
                      <Link href="/login">Login</Link>
                    )}
                  </Button>
                  <Button asChild className="w-full">
                    {session ? (
                      <Link href="/signup">Sign Up</Link>
                    ) : (
                      <Link href="/signup">Sign Up</Link>
                    )}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}