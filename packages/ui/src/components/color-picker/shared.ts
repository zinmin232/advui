import { colorTokens } from '@advui/theme'
import { type HSVA, fromHsv, parseColor, toHex, toHsv, withAlpha } from '@advui/utils'
import type { ColorTokens } from 'tamagui'

// The spectrum, its white and black ends and the transparency grid are the
// colors being picked, not theme roles, so they stay the same in every theme.
export const WHITE = colorTokens.white
export const BLACK = colorTokens.black
export const CLEAR_WHITE = withAlpha(WHITE, 0)
export const CLEAR_BLACK = withAlpha(BLACK, 0)
/** The darker squares of the transparency grid, over white. */
export const CHECKER = withAlpha(BLACK, 0.12)
/** Outline around a thumb's white ring, so it shows on white too. */
export const THUMB_RING = withAlpha(BLACK, 0.45)

/** A computed color for a color prop, which otherwise takes theme keys. */
export const rawColor = (color: string) => color as ColorTokens

/** Thumb diameter (px), with its outline. */
export const THUMB = 18
/** Side of one square of the transparency grid (px). */
export const CHECKER_CELL = 4

export const hueGradient = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360]
  .map((h) => fromHsv({ h, s: 1, v: 1 }))
  .join(', ')})`

/** `#rrggbb`, or `#rrggbbaa` when `alpha` is on and the color is translucent. */
export const formatColor = (hsv: HSVA, alpha: boolean) => fromHsv(alpha ? hsv : { ...hsv, a: 1 })

/**
 * Reads a typed or passed color: hex with or without `#`, `rgb()` or
 * `hsl()`. Null when it is not a color.
 */
export function readColor(input: string) {
  const text = input.trim()
  return parseColor(/^[0-9a-f]{3,8}$/i.test(text) ? `#${text}` : text)
}

/**
 * The HSV of a new value. HSV has more points than hex: every hue is the
 * same black or gray, so a hue (and the saturation of black) that the color
 * does not decide stays where it was. A value that is not a color keeps `prev`.
 */
export function hsvFrom(value: string, prev: HSVA): HSVA {
  const rgba = readColor(value)
  if (!rgba) return prev
  if (toHex(rgba) === fromHsv(prev)) return prev
  const next = toHsv(rgba)
  return {
    h: next.s === 0 || next.v === 0 ? prev.h : next.h,
    s: next.v === 0 ? prev.s : next.s,
    v: next.v,
    a: next.a,
  }
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const focusRing = {
  outlineColor: '$ring',
  outlineStyle: 'solid',
  outlineWidth: 2,
  outlineOffset: 2,
} as const

/** Screen reader actions on native. */
export type AccessibilityActionEvent = { nativeEvent: { actionName: string } }
