import type { Metadata, Viewport } from 'next'
import { Press_Start_2P, VT323 } from 'next/font/google'
import './globals.css'

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-terminal',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OFFICE SPACE — AI Multi-Agent Team',
  description: 'A pixel-art office where 5 AI agents powered by Gemini 2.0 collaborate on missions, review code, and generate reports in real time.',
  keywords: ['AI agents', 'Gemini', 'multi-agent', 'pixel art', 'code review'],
  openGraph: {
    title: 'OFFICE SPACE — AI Multi-Agent Team',
    description: '5 AI agents powered by Gemini 2.0 collaborate in a pixel-art office. Give them a mission and watch them work.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OFFICE SPACE — AI Multi-Agent Team',
    description: '5 Gemini-powered AI agents in a pixel-art office. Watch them think, search the web, review code, and generate reports.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080812',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pressStart.variable} ${vt323.variable}`}>
      <body className="bg-[#080812] overflow-hidden h-screen">{children}</body>
    </html>
  )
}
