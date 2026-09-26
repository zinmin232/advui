import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { colorModeScript } from '../lib/color-mode-script'
import { buildSearchIndex } from '../lib/search'
import { siteConfig } from '../lib/site'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — cross-platform React components`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: { title: siteConfig.name, description: siteConfig.description, type: 'website' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111113' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const searchIndex = buildSearchIndex()
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Applies the saved color mode before first paint (no flash of the wrong theme). */}
        <Script id="aui-color-mode" strategy="beforeInteractive">
          {colorModeScript}
        </Script>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers searchIndex={searchIndex}>{children}</Providers>
      </body>
    </html>
  )
}
