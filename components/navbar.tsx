"use client"

import { Palette } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Palette className="h-6 w-6" />
          <span className="font-bold">Artify</span>
        </Link>
        <nav className="flex items-center space-x-6 ml-6">
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
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}