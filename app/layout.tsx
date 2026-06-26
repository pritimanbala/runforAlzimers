import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "Run for Alzheimer's - Event Registration",
  description:
    "Register for the Run for Alzheimer's campaign. Join us in supporting Alzheimer's awareness and research.",
  generator: 'Pritiman Bala',
  icons: {
    icon: [
      {
        url: '/placeholder-user.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/placeholder-user.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/placeholder-user.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/placeholder-user.jpg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
