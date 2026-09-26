/**
 * Elevation presets. Spread them into `styled()` definitions:
 * `styled(View, { ...shadows.md })`. Colors come from the theme
 * (`$shadowColor`, `$shadowColorStrong`) so dark mode gets deeper shadows.
 * `elevation` is the Android equivalent.
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '$shadowColor',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '$shadowColor',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '$shadowColorStrong',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '$shadowColorStrong',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12,
  },
} as const

export type ShadowName = keyof typeof shadows
