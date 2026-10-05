import { isWeb } from 'tamagui'

/**
 * A boolean ARIA state that turns on and off: `aria-disabled`, `aria-busy`,
 * `aria-selected`. Web leaves an off state out. Native sends `false`: React
 * Native keeps the last value of a prop that is removed, so TalkBack would go
 * on reading "disabled" or "selected" after the state cleared.
 *
 * Not for `aria-checked` or `aria-expanded`: on native, `false` makes any view
 * read as "not checked" or "collapsed".
 */
export function ariaState(on: boolean | null | undefined): boolean | undefined {
  return isWeb ? on || undefined : Boolean(on)
}
