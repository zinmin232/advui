'use client'

import { UniversalProvider } from '@advui/core'
import { useServerInsertedHTML } from 'next/navigation'
import { type ReactNode, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { config } from '../tamagui.config'

export function Providers({ children }: { children: ReactNode }) {
  // React Native Web adds some styles through its own StyleSheet: send them with
  // the server's HTML. Next calls this on every streamed flush, so insert the
  // sheet once.
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

  return <UniversalProvider config={config}>{children}</UniversalProvider>
}
