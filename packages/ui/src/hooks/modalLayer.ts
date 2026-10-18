import { useSyncExternalStore } from 'react'

// Native only. Modal overlays render in a portal next to the app, so TalkBack
// and VoiceOver could still move to the screen behind an open dialog, sheet or
// drawer. Every modal surface reports itself here while open (through
// useBackToClose), and UniversalProvider hides the app from screen readers
// while any is open.

let openCount = 0
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Marks one modal surface as open. Returns the function that marks it closed. */
export function openModalLayer(): () => void {
  openCount += 1
  for (const listener of listeners) listener()
  let closed = false
  return () => {
    if (closed) return
    closed = true
    openCount -= 1
    for (const listener of listeners) listener()
  }
}

/** True while any modal surface is open. */
export function useModalLayerOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => openCount > 0,
    () => false,
  )
}
