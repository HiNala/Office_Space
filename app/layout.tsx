import type { Metadata } from 'next'
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
  title: 'OFFICE SPACE',
  description: 'Your AI dream team, pixelated',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pressStart.variable} ${vt323.variable}`}>
      <body className="bg-[#0a0a0f] overflow-hidden h-screen">{children}</body>
    </html>
  )
}
