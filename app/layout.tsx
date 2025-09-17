import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from '@/components/navbar';
import AuthSessionProvider from '@/components/auth-session-provider';
import FooterController from '@/components/footer-controller';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Artify - AI-Powered Custom Artwork Marketplace',
  description: 'Discover and commission unique artwork from talented artists worldwide',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {/* Avoid forced extra scroll: main fills viewport minus 4rem navbar */}
            <main className="min-h-[calc(100dvh-4rem)] md:min-h-[calc(100vh-4rem)] bg-background pt-2 md:pt-4">
              {children}
            </main>
            <FooterController />
            <Toaster />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
