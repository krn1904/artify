import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account | Artify',
  description: 'Join Artify to discover and commission artwork.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}

