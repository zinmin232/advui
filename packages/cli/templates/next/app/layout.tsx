import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { Header } from './header'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Adv UI app',
  description: 'A Next.js app built with Adv UI.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Tamagui adds the color mode's class (t_light or t_dark) to <html> in the browser.
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
