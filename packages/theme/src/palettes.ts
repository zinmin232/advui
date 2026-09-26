/**
 * 12-step color scales. Built-in scales come from Radix Colors (MIT, shipped
 * via `@tamagui/colors`), which are hand-tuned separately for light and dark
 * mode — dark mode is designed, not inverted. Custom brand colors are turned
 * into scales with `generateScale`.
 *
 * Step semantics (same as Radix):
 *  1-2  app / subtle backgrounds      3-5  component backgrounds (rest/hover/active)
 *  6-8  borders (subtle/default/hover)  9-10 solid fills (rest/hover)
 *  11   low-contrast text             12   high-contrast text
 */
import {
  amber,
  amberDark,
  blue,
  blueDark,
  crimson,
  crimsonDark,
  gray,
  grayDark,
  green,
  greenDark,
  indigo,
  indigoDark,
  mauve,
  mauveDark,
  orange,
  orangeDark,
  red,
  redDark,
  sage,
  sageDark,
  sand,
  sandDark,
  slate,
  slateDark,
  teal,
  tealDark,
  violet,
  violetDark,
} from '@tamagui/colors'
import { fromOklch, isValidColor, toOklch } from '@adv-ui/utils'

export type ScaleSteps = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
]

export interface ColorScale {
  light: ScaleSteps
  dark: ScaleSteps
}

const steps = (record: Record<string, string>) => Object.values(record) as unknown as ScaleSteps
const scale = (light: Record<string, string>, dark: Record<string, string>): ColorScale => ({
  light: steps(light),
  dark: steps(dark),
})

export const scales = {
  indigo: scale(indigo, indigoDark),
  blue: scale(blue, blueDark),
  violet: scale(violet, violetDark),
  green: scale(green, greenDark),
  teal: scale(teal, tealDark),
  orange: scale(orange, orangeDark),
  amber: scale(amber, amberDark),
  crimson: scale(crimson, crimsonDark),
  red: scale(red, redDark),
  gray: scale(gray, grayDark),
  slate: scale(slate, slateDark),
  mauve: scale(mauve, mauveDark),
  sage: scale(sage, sageDark),
  sand: scale(sand, sandDark),
} as const

export type ScaleName = keyof typeof scales

export const neutralScaleNames = ['gray', 'slate', 'mauve', 'sage', 'sand'] as const
export type NeutralScaleName = (typeof neutralScaleNames)[number]

/** A named built-in scale, a hex/rgb/hsl color string, or a complete custom scale. */
export type ColorSource = ScaleName | (string & {}) | ColorScale

// Target OKLCH lightness per step, and chroma as a fraction of the base chroma.
const LIGHT_L = [0.993, 0.982, 0.956, 0.93, 0.9, 0.865, 0.815, 0.745, 0, 0, 0.5, 0.29]
const DARK_L = [0.175, 0.205, 0.255, 0.295, 0.335, 0.38, 0.44, 0.52, 0, 0, 0.8, 0.93]
const CHROMA = [0.02, 0.05, 0.12, 0.2, 0.28, 0.36, 0.46, 0.62, 1, 1, 0.85, 0.45]

/**
 * Generates a light + dark 12-step scale around a single brand color. Step 9
 * is the exact input color in both modes, mirroring how Radix scales work.
 */
export function generateScale(color: string): ColorScale {
  const base = toOklch(color)
  const build = (targets: number[], hoverShift: number) =>
    targets.map((l, i) => {
      if (i === 8) return fromOklch({ ...base, a: 1 })
      if (i === 9) return fromOklch({ ...base, l: base.l + hoverShift, a: 1 })
      return fromOklch({ l, c: base.c * CHROMA[i]!, h: base.h })
    }) as unknown as ScaleSteps

  return { light: build(LIGHT_L, -0.05), dark: build(DARK_L, 0.05) }
}

export function resolveScale(source: ColorSource): ColorScale {
  if (typeof source === 'object') return source
  if (source in scales) return scales[source as ScaleName]
  if (isValidColor(source)) return generateScale(source)
  throw new Error(
    `[adv-ui] Unknown color "${source}". Use a scale name (${Object.keys(scales).join(', ')}) or a color string.`,
  )
}
