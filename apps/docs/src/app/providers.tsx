'use client'

import { UniversalProvider } from '@advui/core'
import { useServerInsertedHTML } from 'next/navigation'
import { useRef, type ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { config } from '../../tamagui.config'
import { CommandPalette, CommandPaletteProvider } from '../components/command-palette'
import { ColorModeSettingProvider } from '../lib/color-mode'
import type { SearchEntry } from '../lib/search'
import { ThemeStoreProvider } from '../lib/theme-store'

export function Providers({
  children,
  searchIndex,
}: {
  children: ReactNode
  searchIndex: SearchEntry[]
}) {
  // react-native-web registers some styles through its own StyleSheet; flush them during SSR.
  // Next calls this on every streamed flush, so insert the sheet once: each copy
  // repeats the whole sheet under the same id, and the client adopts only the first.
  const sheetInserted = useRef(false)
  useServerInsertedHTML(() => {
    if (sheetInserted.current) return null
    const sheet = (
      StyleSheet as unknown as { getSheet?: () => { id: string; textContent: string } }
    ).getSheet?.()
    if (!sheet) return null
    sheetInserted.current = true
    return <style id={sheet.id} dangerouslySetInnerHTML={{ __html: sheet.textContent }} />
  })

  return (
    <ColorModeSettingProvider>
      {(resolved) => (
        <UniversalProvider
          config={config}
          colorMode={resolved}
          toaster={{ position: 'bottom-right' }}
        >
          <ThemeStoreProvider>
            <CommandPaletteProvider>
              {children}
              <CommandPalette entries={searchIndex} />
            </CommandPaletteProvider>
          </ThemeStoreProvider>
        </UniversalProvider>
      )}
    </ColorModeSettingProvider>
  )
}
