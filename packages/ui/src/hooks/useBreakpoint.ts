import { useMedia } from 'tamagui/unstyled'
import {
  type Breakpoint,
  type Responsive,
  breakpointKeys,
  resolveResponsive,
} from '../utils/responsive'

/**
 * The largest min-width breakpoint the window matches, or `'base'` below `xs`.
 * It re-renders when that changes.
 *
 * The server can't know the width, so it renders for a phone (the config's
 * `mediaQueryDefaultActive`, `xs` here). Tamagui's `useMedia` renders the
 * same on the client first, so the markup matches and React logs no hydration
 * error, then corrects it before paint. Lay pages out with Show / Hide
 * or responsive props, which are CSS on web, and keep this for behavior.
 */
export function useBreakpoint(): 'base' | Breakpoint {
  // Read every key on every render: Tamagui 3 updates a component only for
  // the media keys it read while rendering.
  const media = useMedia() as Record<string, boolean | undefined>
  let current: 'base' | Breakpoint = 'base'
  for (const key of breakpointKeys) if (media[key]) current = key
  return current
}

/**
 * The value of a responsive prop at the current breakpoint, with the same
 * mobile-first cascade as the layout props: `{ base: 1, md: 3 }` is 1 below md
 * and 3 from md. `undefined` below the first breakpoint of a map without `base`.
 */
export function useBreakpointValue<T>(value: Responsive<T>): T | undefined {
  return resolveResponsive(value, useBreakpoint())
}
