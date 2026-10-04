import { View, type ViewProps, styled } from 'tamagui'
import {
  type BreakpointRange,
  type HideProps,
  type ShowProps,
  isEmptyRange,
  rangeSteps,
} from './range'

// Web: CSS media queries hide the content, so the server renders the right
// thing for every width (no flash, no hydration mismatch) and the content
// stays mounted. `display: contents` keeps the wrapper out of the layout:
// its children lay out as if they were the parent's own.
const Frame = styled(View, { name: 'ShowHide', display: 'contents' })

// Bundlers replace `process.env.NODE_ENV`; this types it for apps without Node's types.
declare const process: { env: { NODE_ENV?: string } }

let warned = false

function displayStyle(range: BreakpointRange, show: boolean): ViewProps {
  if (isEmptyRange(range)) {
    if (process.env.NODE_ENV !== 'production' && !warned) {
      warned = true
      console.warn('Show / Hide: `below` must be a larger breakpoint than `above`.')
    }
    return { display: show ? 'none' : 'contents' }
  }
  const style: Record<string, unknown> = {}
  for (const [key, inRange] of Object.entries(rangeSteps(range))) {
    const display = inRange === show ? 'contents' : 'none'
    if (key === 'base') style.display = display
    else style[`$${key}`] = { display }
  }
  return style as ViewProps
}

/** Renders its children only while the window is in the range: `above="md"` is md and up. */
export function Show({ children, ...range }: ShowProps) {
  return <Frame {...displayStyle(range as BreakpointRange, true)}>{children}</Frame>
}

/** Renders its children except while the window is in the range: `below="sm"` hides on phones. */
export function Hide({ children, ...range }: HideProps) {
  return <Frame {...displayStyle(range as BreakpointRange, false)}>{children}</Frame>
}

export type { BreakpointRange, HideProps, ShowProps } from './range'
