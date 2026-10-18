import { useEffect, useRef } from 'react'
import { BackHandler } from 'react-native'
import { openModalLayer } from './modalLayer'
import type { BackToCloseOptions } from './useBackToClose'

/**
 * Android: while `open`, the hardware back button (or back gesture) calls
 * `close` instead of going back in the app's navigation. Listeners run newest
 * first, so an open overlay handles the press before the router, and a nested
 * overlay before its parent. iOS has no back button, so there it never fires;
 * web uses useBackToClose.ts, which does nothing.
 *
 * Tamagui's Dialog, Sheet and Popover render in portals with no back handling
 * of their own, so every modal surface calls this from its root. While open it
 * also counts as a modal layer, so UniversalProvider hides the screen behind it
 * from TalkBack and VoiceOver (iOS and Android). A panel that opens in place,
 * inside the screen, passes `{ modal: false }`.
 */
export function useBackToClose(
  open: boolean,
  close: () => void,
  { modal = true }: BackToCloseOptions = {},
) {
  // Latest `close` without re-subscribing, which would reorder the listeners.
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  })

  useEffect(() => {
    if (!open) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeRef.current()
      return true
    })
    const closeLayer = modal ? openModalLayer() : null
    return () => {
      subscription.remove()
      closeLayer?.()
    }
  }, [open, modal])
}
