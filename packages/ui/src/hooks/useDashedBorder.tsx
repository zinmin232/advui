import type { ReactNode } from 'react'

/** A frame style, and an element drawn over the frame, that keep its dashed border dashed. */
export interface DashedBorder {
  frame: { borderColor: 'transparent' } | undefined
  overlay: ReactNode
}

/**
 * What keeps a rounded dashed border dashed on native (see
 * `useDashedBorder.native.tsx`). Web needs none: its border is already dashed.
 */
export function useDashedBorder(_color: string | null, _radius: string): DashedBorder {
  return { frame: undefined, overlay: null }
}
