import { createContext } from 'react'
import type { ButtonVariant } from './Button'

export type ButtonGroupOrientation = 'horizontal' | 'vertical'
export type ButtonGroupSize = 'sm' | 'md' | 'lg'
type Position = 'first' | 'middle' | 'last' | 'only'

export interface ButtonGroupContextValue {
  variant?: ButtonVariant
  size?: ButtonGroupSize
  attached: boolean
  orientation: ButtonGroupOrientation
}

/** Group-wide defaults that buttons inside a ButtonGroup read. */
export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null)

/** Where a button sits in its group, for joined corners. */
export const ButtonGroupItemContext = createContext<Position | null>(null)

export function positionOf(index: number, count: number): Position {
  if (count === 1) return 'only'
  if (index === 0) return 'first'
  return index === count - 1 ? 'last' : 'middle'
}

const ring = {
  outlineColor: '$ring',
  outlineStyle: 'solid',
  outlineWidth: 2,
  outlineOffset: 2,
} as const

/**
 * Styles that join a button to its neighbours: square inner corners, and a
 * shared 1px border for outline buttons or a 1px gap between filled ones.
 */
export function attachedStyle(
  position: Position,
  orientation: ButtonGroupOrientation,
  variant: ButtonVariant,
) {
  const horizontal = orientation === 'horizontal'
  const start = position === 'first' || position === 'only'
  const end = position === 'last' || position === 'only'
  return {
    // Lifts the focused button so its ring is not covered by its neighbour.
    position: 'relative',
    focusVisibleStyle: { ...ring, zIndex: 1 },
    ...(!start && {
      ...(horizontal
        ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
        : { borderTopLeftRadius: 0, borderTopRightRadius: 0 }),
      [horizontal ? 'marginLeft' : 'marginTop']: variant === 'outline' ? -1 : 1,
    }),
    ...(!end &&
      (horizontal
        ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
        : { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 })),
  } as const
}
