import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Artify',
  description: 'Manage your profile, artworks, and commissions.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}

