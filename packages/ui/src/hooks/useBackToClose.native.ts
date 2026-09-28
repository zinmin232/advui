import { useEffect, useRef } from 'react'
import { BackHandler } from 'react-native'

/**
 * Android: while `open`, the hardware back button (or back gesture) calls
 * `close` instead of going back in the app's navigation. Listeners run newest
 * first, so an open overlay handles the press before the router, and a nested
 * overlay before its parent. iOS has no back button, so there it never fires;
 * web uses useBackToClose.ts, which does nothing.
 *
 * Tamagui's Dialog, Sheet and Popover render in portals with no back handling
 * of their own, so every modal surface calls this from its root.
 */
export function useBackToClose(open: boolean, close: () => void) {
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
    return () => subscription.remove()
  }, [open])
}
