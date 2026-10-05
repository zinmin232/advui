import type { ReactNode } from 'react'
import { type Breakpoint, breakpointKeys } from '../../utils/responsive'

/** A width range: from `above` (inclusive) to `below` (exclusive). Give at least one. */
export type BreakpointRange =
  { above: Breakpoint; below?: Breakpoint } | { above?: Breakpoint; below: Breakpoint }

export type ShowProps = BreakpointRange & { children?: ReactNode }
export type HideProps = ShowProps

/**
 * Whether the window is in the range at each breakpoint it changes at:
 * `above="sm" below="lg"` is `{ base: false, sm: true, lg: false }`. Out of
 * range below `above`, in range from it, and out of range again from `below`.
 */
export function rangeSteps({ above, below }: BreakpointRange) {
  const steps: Partial<Record<'base' | Breakpoint, boolean>> = { base: !above }
  if (above) steps[above] = true
  if (below) steps[below] = false
  return steps
}

/** True when `below` is not above `above`, so nothing is ever in range. */
export function isEmptyRange({ above, below }: BreakpointRange) {
  return (
    above !== undefined &&
    below !== undefined &&
    breakpointKeys.indexOf(below) <= breakpointKeys.indexOf(above)
  )
}
