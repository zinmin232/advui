import { createFont, isWeb } from 'tamagui'

export const fontScales = {
  compact: 0.9375,
  default: 1,
  large: 1.125,
} as const

export type FontScale = keyof typeof fontScales

/** Type scale in px: `$1` xs(12) · `$2` sm(14) · `$3` base(16) · … · `$10` 6xl(60). */
const baseSizes = {
  1: 12,
  2: 14,
  3: 16,
  4: 18,
  5: 20,
  6: 24,
  7: 30,
  8: 36,
  9: 48,
  10: 60,
  true: 16,
} as const

type SizeKey = keyof typeof baseSizes

const systemStack =
  '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
const monoStack =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

function mapSizes(fn: (px: number) => number) {
  return Object.fromEntries(Object.entries(baseSizes).map(([key, px]) => [key, fn(px)])) as Record<
    SizeKey,
    number
  >
}

export interface FontFamilies {
  /** CSS font stack on web. */
  body?: string
  heading?: string
  mono?: string
  /** Loaded font family names on iOS/Android (defaults to the platform system font). */
  native?: { body?: string; heading?: string; mono?: string }
}

export function createUniversalFonts({
  scale = 'default',
  families = {},
}: { scale?: FontScale | number; families?: FontFamilies } = {}) {
  const factor = typeof scale === 'number' ? scale : fontScales[scale]
  const size = mapSizes((px) => Math.round(px * factor))
  const pick = (web: string, native: string | undefined, fallback: string) =>
    isWeb ? web : (native ?? fallback)

  const weight = { 1: '400', 4: '400', 5: '500', 6: '600', 7: '700', true: '400' } as const

  const body = createFont({
    family: pick(families.body ?? systemStack, families.native?.body, 'System'),
    size,
    lineHeight: mapSizes((px) => Math.round(px * factor * (px <= 20 ? 1.5 : 1.3))),
    weight,
    letterSpacing: { 1: 0, true: 0 },
  })

  const heading = createFont({
    family: pick(
      families.heading ?? families.body ?? systemStack,
      families.native?.heading,
      'System',
    ),
    size,
    lineHeight: mapSizes((px) => Math.round(px * factor * (px <= 20 ? 1.4 : 1.2))),
    weight: { ...weight, true: '600' },
    letterSpacing: { 1: 0, 6: -0.3, 7: -0.5, 8: -0.7, 9: -1, 10: -1.2, true: 0 },
  })

  const mono = createFont({
    family: pick(families.mono ?? monoStack, families.native?.mono, 'monospace'),
    size: mapSizes((px) => Math.round(px * factor * 0.92)),
    lineHeight: mapSizes((px) => Math.round(px * factor * 1.6)),
    weight,
    letterSpacing: { 1: 0, true: 0 },
  })

  return { body, heading, mono }
}
