import { createTokens } from 'tamagui'

/**
 * 4px-based spacing scale: `$1` = 4px, `$4` = 16px, `$10` = 40px.
 * Negative keys (`$-2`) exist for margins.
 */
const spaceScale = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const

type SpaceKey = keyof typeof spaceScale
type NegativeSpace = { [K in Exclude<SpaceKey, 0> as `-${K}`]: number }

export const space = {
  ...spaceScale,
  true: 16,
  ...(Object.fromEntries(
    Object.entries(spaceScale)
      .filter(([key]) => key !== '0')
      .map(([key, value]) => [`-${key}`, -value]),
  ) as NegativeSpace),
}

/** Sizes share the spacing scale and extend it for larger layout boxes. */
export const size = {
  ...spaceScale,
  40: 160,
  48: 192,
  56: 224,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
  112: 448,
  128: 512,
  144: 576,
  168: 672,
  192: 768,
  224: 896,
  true: 40,
} as const

export const radiusScales = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const

export type RadiusScale = keyof typeof radiusScales

export type RadiusToken =
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'button' | 'buttonLg' | 'dialog'

/** Exact values for some radius tokens, on top of a base (`md` if omitted). */
export type RadiusOverrides = { base?: RadiusScale | number } & Partial<Record<RadiusToken, number>>

export type RadiusInput = RadiusScale | number | RadiusOverrides

/**
 * Radius tokens derived from a single base value so the whole library can be
 * made sharper or rounder at once. Components pick semantic steps:
 * controls `$md`, menus/popovers `$lg`, cards `$xl`, pills `$full`, and role
 * tokens a design system can reshape on their own: `$button` / `$buttonLg`
 * (buttons, icon buttons, toggles) and `$dialog` (dialogs and sheets).
 */
export function createRadius(input: RadiusInput = 'md') {
  const overrides = typeof input === 'object' ? input : {}
  const scale = typeof input === 'object' ? (input.base ?? 'md') : input
  const base = typeof scale === 'number' ? scale : radiusScales[scale]
  const r = (factor: number) => Math.round(base * factor)
  const { base: _base, ...exact } = overrides
  const tokens = {
    0: 0,
    xs: r(0.25),
    sm: r(0.5),
    md: r(0.75),
    lg: r(1),
    xl: r(1.5),
    '2xl': r(2),
    '3xl': r(3),
    full: 9999,
    button: r(0.75),
    buttonLg: r(1),
    dialog: r(1.5),
    ...exact,
  }
  return { ...tokens, true: tokens.md }
}

export const zIndex = {
  0: 0,
  1: 1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const

export const colorTokens = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'rgba(0, 0, 0, 0)',
} as const

export function createUniversalTokens({ radius = 'md' }: { radius?: RadiusInput } = {}) {
  return createTokens({
    space,
    size,
    radius: createRadius(radius),
    zIndex,
    color: colorTokens,
  })
}
