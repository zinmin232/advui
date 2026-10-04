import { useMedia } from 'tamagui'
import { type BreakpointRange, type HideProps, type ShowProps, isEmptyRange } from './range'

// Native has no CSS: read the window size and leave the hidden content out,
// so it is unmounted (and its state reset) while hidden.
function useInRange({ above, below }: BreakpointRange) {
  const media = useMedia()
  if (isEmptyRange({ above, below } as BreakpointRange)) return false
  return (!above || media[above]) && (!below || !media[below])
}

/** Renders its children only while the window is in the range: `above="md"` is md and up. */
export function Show({ children, ...range }: ShowProps) {
  return useInRange(range as BreakpointRange) ? <>{children}</> : null
}

/** Renders its children except while the window is in the range: `below="sm"` hides on phones. */
export function Hide({ children, ...range }: HideProps) {
  return useInRange(range as BreakpointRange) ? null : <>{children}</>
}

export type { BreakpointRange, HideProps, ShowProps } from './range'
