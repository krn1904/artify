import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Artify',
  description: 'Sign in to manage your account.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}

