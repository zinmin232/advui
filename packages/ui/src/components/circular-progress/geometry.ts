/** Diameter and stroke in px per size, shared by the web and native renderers. */
export const circularSizes = {
  sm: { diameter: 24, stroke: 3 },
  md: { diameter: 40, stroke: 4 },
  lg: { diameter: 64, stroke: 6 },
} as const

export type CircularProgressSize = keyof typeof circularSizes
export type CircularProgressTone = 'primary' | 'success' | 'warning' | 'error'

export const toneColor = {
  primary: '$primary',
  success: '$success',
  warning: '$warning',
  error: '$error',
} as const satisfies Record<CircularProgressTone, `$${string}`>

// The percentage label is only legible from `md` up.
export const valueFontSize = { sm: null, md: '$1', lg: '$3' } as const

/** The share of the ring an indeterminate indicator covers while it spins. */
const INDETERMINATE_FRACTION = 0.25

/**
 * Circle geometry for a ring of `size`: its radius, circumference and the
 * dash offset that shows `fraction` (0–1) of it, or a spinning quarter when
 * `fraction` is null.
 */
export function ring(size: CircularProgressSize, fraction: number | null) {
  const { diameter, stroke } = circularSizes[size]
  const radius = (diameter - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const shown = fraction ?? INDETERMINATE_FRACTION
  return {
    diameter,
    stroke,
    center: diameter / 2,
    radius,
    circumference,
    offset: circumference * (1 - shown),
    visible: shown > 0,
  }
}

/** The value clamped to 0…max, as a fraction, or null when indeterminate. */
export function progressFraction(value: number | null, max: number) {
  if (value === null) return { clamped: null, fraction: null }
  const clamped = Math.min(max, Math.max(0, value))
  return { clamped, fraction: max > 0 ? clamped / max : 0 }
}
