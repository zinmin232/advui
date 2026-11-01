import { createContext, useCallback, useContext, useState } from 'react'

/** Stops scrolling until the release it returns is called. */
export type ScrollLock = () => () => void

/** The lock of the nearest Adv UI scroll view (iOS and Android), or null. */
export const ScrollLockContext = createContext<ScrollLock | null>(null)

const noRelease = () => {}

/**
 * iOS / Android: stops the Adv UI scroll views around a component (ScrollArea,
 * AppShell's Main) while a finger drags something inside them, and returns the
 * release. Lock when the drag starts, before the finger moves: React Native's
 * JS responder claims a move only after Android's native scroll view has
 * seen it, and a quick first move would scroll the screen and cancel the drag.
 * Elsewhere, and outside such a scroll view, it does nothing.
 */
export function useScrollLock(): ScrollLock {
  const lock = useContext(ScrollLockContext)
  return useCallback(() => lock?.() ?? noRelease, [lock])
}

/**
 * A scroll view's own lock: whether something inside holds it, and the lock to
 * give the ones inside, which stops this one and every one around it.
 */
export function useScrollLockState() {
  const outer = useContext(ScrollLockContext)
  const [holds, setHolds] = useState(0)
  const lock = useCallback<ScrollLock>(() => {
    setHolds((count) => count + 1)
    const releaseOuter = outer?.()
    let released = false
    return () => {
      if (released) return
      released = true
      setHolds((count) => count - 1)
      releaseOuter?.()
    }
  }, [outer])
  return { locked: holds > 0, lock }
}
