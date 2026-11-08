import { useSyncExternalStore } from 'react'
import { AccessibilityInfo } from 'react-native'

// One answer for the whole app, asked for when this loads. Each hook used to
// ask on mount and hear back after its first render, so with "Remove
// animations" on every component that reads it rendered twice: a Tooltip then
// cloned its trigger again, and the trigger's springs started over (51 more on
// the Admin example's mount).
let reduced = false
const listeners = new Set<() => void>()

function update(value: boolean) {
  if (value === reduced) return
  reduced = value
  for (const listener of listeners) listener()
}

AccessibilityInfo.isReduceMotionEnabled().then(update)
AccessibilityInfo.addEventListener('reduceMotionChanged', update)

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getReduced = () => reduced

/** `true` when "Reduce Motion" (iOS) / "Remove animations" (Android) is enabled. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getReduced, getReduced)
}
