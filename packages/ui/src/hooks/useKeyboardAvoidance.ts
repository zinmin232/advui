import { createContext } from 'react'

/** True inside a scroll view that already avoids the keyboard. */
export const KeyboardAvoidanceContext = createContext(false)

export interface KeyboardAvoidance {
  /** Whether this scroll view avoids the keyboard: asked to, and not inside one that does. */
  avoid: boolean
  /** Android: how far the keyboard covers the scroll view, in px, to take off its bottom. */
  inset: number
  /** The value to give KeyboardAvoidanceContext below this scroll view. */
  context: boolean
}

/**
 * iOS / Android: whether a screen's scroll view keeps its focused field above
 * the keyboard, and on Android by how much it ends higher. See
 * useKeyboardAvoidance.native.ts. Browsers resize the viewport for an
 * on-screen keyboard themselves, so on web nothing moves.
 */
export function useKeyboardAvoidance(
  _ref: { current: unknown },
  _requested: boolean,
): KeyboardAvoidance {
  return { avoid: false, inset: 0, context: false }
}
