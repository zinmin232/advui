import type { TransitionKeys } from 'tamagui/unstyled'

/**
 * A transition for the named properties only, in CSS names with no
 * shorthands (`width, background-color`). Every transition names them: a
 * preset alone animates every style, and on native that includes border
 * widths, which React Native's native animation driver does not take.
 * `null` or `undefined` (reduced motion) stays as it is, so nothing animates.
 */
export function namedTransition<T extends TransitionKeys | null | undefined>(
  preset: T,
  properties: string,
) {
  return preset ? { preset, properties } : (preset as Exclude<T, TransitionKeys>)
}

/**
 * A transition that animates only `transform` and `opacity`, as overlays and
 * menus do: both animate without layout work on every driver.
 */
export function transformOpacity<T extends TransitionKeys | null | undefined>(preset: T) {
  return namedTransition(preset, 'transform, opacity')
}

// A transition names each property it animates, with no CSS shorthands, and
// Tamagui writes a border color per side on native.
const colorProperties = [
  'background-color',
  'color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'opacity',
].join(', ')

/**
 * A transition for the colors and `opacity` that a control's states change
 * (press, hover, checked), plus any `extra` properties. A preset alone animates
 * every style, height and radii included: on native that puts the control on
 * React Native's JS animation driver, and each style change restarts a spring
 * per style key, so a color mode switch started about 30 for every Button.
 */
export function colorsOpacity(preset: TransitionKeys, extra?: string) {
  return { preset, properties: extra ? `${colorProperties}, ${extra}` : colorProperties }
}
