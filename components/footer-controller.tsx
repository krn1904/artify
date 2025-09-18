"use client"

import { usePathname } from "next/navigation"
import Footer from "@/components/footer"
import { isPublicPath } from "@/lib/publicPaths"

export default function FooterController() {
  const pathname = usePathname() || "/"
  // Exclude certain public routes from showing the footer (marketing style choice)
  const EXCLUDE: RegExp[] = [
    /^\/login$/,
    /^\/signup$/,
    /^\/explore(\/.*)?$/,
    /^\/artists(\/.*)?$/,
    /^\/commissions(\/.*)?$/,
  ]
  if (!isPublicPath(pathname) || EXCLUDE.some((rx) => rx.test(pathname))) return null
  return <Footer />
}
