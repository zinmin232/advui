import { isWeb } from 'tamagui'

/** Mobile-first breakpoints (px). `xxl` is the "2xl" breakpoint. */
export const breakpoints = {
  xs: 460,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const

type MediaQuery = { [key: string]: string | number }

const below = (px: number): MediaQuery => ({ maxWidth: px - (isWeb ? 0.02 : 1) })

// Order matters: later keys win when several queries match.
export const media = {
  // always true on native (touch screens), pointer-based on web
  touchable: (isWeb ? { pointer: 'coarse' } : { minWidth: 0 }) as MediaQuery,
  // never true on native: hover-only UI must have a touch alternative
  hoverable: (isWeb ? { hover: 'hover' } : { maxWidth: 0 }) as MediaQuery,

  'max-xxl': below(breakpoints.xxl),
  'max-xl': below(breakpoints.xl),
  'max-lg': below(breakpoints.lg),
  'max-md': below(breakpoints.md),
  'max-sm': below(breakpoints.sm),
  'max-xs': below(breakpoints.xs),

  xs: { minWidth: breakpoints.xs },
  sm: { minWidth: breakpoints.sm },
  md: { minWidth: breakpoints.md },
  lg: { minWidth: breakpoints.lg },
  xl: { minWidth: breakpoints.xl },
  xxl: { minWidth: breakpoints.xxl },
} as const

/** Assumed active queries during SSR / first render (a phone-sized viewport). */
export const mediaQueryDefaultActive = {
  touchable: !isWeb,
  hoverable: isWeb,
  'max-xxl': true,
  'max-xl': true,
  'max-lg': true,
  'max-md': true,
  'max-sm': true,
  'max-xs': false,
  xs: true,
  sm: false,
  md: false,
  lg: false,
  xl: false,
  xxl: false,
}
