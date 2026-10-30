import type { TransitionKeys } from 'tamagui/unstyled'

/**
 * A transition that animates only `transform` and `opacity`, as overlays and
 * menus do: both animate without layout work on every driver. `null` or
 * `undefined` (reduced motion) stays as it is, so nothing animates.
 */
export function transformOpacity<T extends TransitionKeys | null | undefined>(preset: T) {
  return preset
    ? { preset, properties: 'transform, opacity' }
    : (preset as Exclude<T, TransitionKeys>)
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
