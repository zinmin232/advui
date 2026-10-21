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
