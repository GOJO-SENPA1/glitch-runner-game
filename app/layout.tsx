import type { Metadata } from 'next'
import { Geist, Geist_Mono, Share_Tech_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'
import '@/styles/game.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const shareTechMono = Share_Tech_Mono({ weight: '400', subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GLITCH RUNNER - Cyberpunk Endless Runner',
  description: 'Escape deletion inside a corrupted server with hand gesture controls',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
