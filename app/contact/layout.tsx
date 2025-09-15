import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Artify',
  description: 'Get in touch with the Artify team.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}

