import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GoWork — Flexible workspaces across Baku',
  description: 'Discover professional workspaces across Baku and work closer to where you are.',
  generator: 'GoWork',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F8FAFC',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-[var(--surface)]"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
