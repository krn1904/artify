import Link from "next/link"

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <Link href="/" className="text-lg font-semibold">Artify</Link>
            <p className="text-sm text-muted-foreground">Discover, commission, and showcase original art from talented creators worldwide.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-foreground">Explore</Link></li>
              <li><Link href="/artists" className="hover:text-foreground">Artists</Link></li>
              <li><Link href="/commissions" className="hover:text-foreground">Commissions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About</Link></li>
              <li><Link href="/about/faq" className="hover:text-foreground">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-xs text-muted-foreground">© {year} Artify. All rights reserved.</div>
      </div>
    </footer>
  )
}
