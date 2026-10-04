import { accessibleSolid, adjustLightness, ensureContrast, withAlpha } from '@advui/utils'
import { type ColorScale, type ColorSource, type ScaleSteps, resolveScale } from './palettes'
import { chartColors } from './chart'
import { type ModeThemes, type SubThemes, withSubThemes } from './subThemes'

export type ColorMode = 'light' | 'dark'

/**
 * Every value a Adv UI theme defines. The first block is Tamagui's
 * standard theme contract (used by Tamagui primitives); the rest are the
 * semantic tokens our components use (`$primary`, `$mutedForeground`, …).
 */
export type ThemeValues = {
  // Tamagui standard keys
  background: string
  backgroundHover: string
  backgroundPress: string
  backgroundFocus: string
  backgroundStrong: string
  backgroundTransparent: string
  color: string
  colorHover: string
  colorPress: string
  colorFocus: string
  colorTransparent: string
  borderColor: string
  borderColorHover: string
  borderColorPress: string
  borderColorFocus: string
  placeholderColor: string
  outlineColor: string
  shadowColor: string
  shadowColorStrong: string
  color1: string
  color2: string
  color3: string
  color4: string
  color5: string
  color6: string
  color7: string
  color8: string
  color9: string
  color10: string
  color11: string
  color12: string

  // Surfaces
  foreground: string
  muted: string
  mutedForeground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  overlay: string

  // Lines
  border: string
  borderStrong: string
  input: string
  ring: string

  // Brand
  primary: string
  primaryHover: string
  primaryPress: string
  primaryForeground: string
  /** Primary-colored text/links on the page background (≥4.5:1). `primary` is a fill color. */
  primaryText: string
  /** Primary-colored text on inverse surfaces (`$foreground` as a background), e.g. a snackbar action. */
  inversePrimary: string
  primarySoft: string
  primarySoftHover: string
  primarySoftForeground: string
  secondary: string
  secondaryHover: string
  secondaryPress: string
  secondaryForeground: string
  accent: string
  accentHover: string
  accentForeground: string

  // Intent
  destructive: string
  destructiveHover: string
  destructivePress: string
  destructiveForeground: string
  destructiveSoft: string
  destructiveSoftForeground: string
  success: string
  successForeground: string
  successSoft: string
  successSoftForeground: string
  successBorder: string
  warning: string
  warningForeground: string
  warningSoft: string
  warningSoftForeground: string
  warningBorder: string
  error: string
  errorForeground: string
  errorSoft: string
  errorSoftForeground: string
  errorBorder: string
  info: string
  infoForeground: string
  infoSoft: string
  infoSoftForeground: string
  infoBorder: string

  // Chart series, in their fixed order (see chart.ts).
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  chart6: string
  chart7: string
  chart8: string
}

export type ThemeKey = keyof ThemeValues

export interface ThemeColorsInput {
  /** Brand color used for primary actions, focus rings and selection. */
  primary?: ColorSource
  /** Soft surface for secondary actions. Defaults to the neutral scale. */
  secondary?: ColorSource
  /** Highlight surface for hovered menu items, ghost buttons, etc. Defaults to neutral. */
  accent?: ColorSource
  /** Gray scale for backgrounds, borders and text. */
  neutral?: ColorSource
  destructive?: ColorSource
  success?: ColorSource
  warning?: ColorSource
  error?: ColorSource
  info?: ColorSource
  /**
   * `true` makes the primary color the neutral's high-contrast step
   * (black in light mode, white in dark mode) — the "Slate"/"Neutral" look.
   */
  monochrome?: boolean
  /** Escape hatch: override any generated value per mode. */
  overrides?: Partial<Record<ColorMode, Partial<ThemeValues>>>
}

/** Light and dark themes, plus the primary and inverse sub-themes (see `withSubThemes`). */
export type GeneratedThemes = ModeThemes & SubThemes

const WHITE = '#ffffff'

type Solid = { base: string; hover: string; press: string; foreground: string }

function solid(background: string, darkText: string): Solid {
  const pair = accessibleSolid(background, { dark: darkText })
  return {
    base: pair.background,
    hover: adjustLightness(pair.background, -0.05),
    press: adjustLightness(pair.background, -0.09),
    foreground: pair.foreground,
  }
}

function status(scale: ScaleSteps, darkText: string) {
  const s = solid(scale[8], darkText)
  return {
    solid: s.base,
    foreground: s.foreground,
    soft: scale[2],
    // Radix step 11 targets APCA; nudge it until it also meets WCAG AA on step 3.
    softForeground: ensureContrast(scale[10], scale[2]),
    border: scale[5],
  }
}

function buildMode(mode: ColorMode, input: Required<Omit<ThemeColorsInput, 'overrides'>>) {
  const pick = (source: ColorSource): ScaleSteps => resolveScale(source)[mode]
  const n = pick(input.neutral)
  const isDark = mode === 'dark'
  const darkText = isDark ? n[0] : n[11]

  const primary = input.monochrome
    ? {
        base: n[11],
        hover: isDark ? n[10] : adjustLightness(n[11], 0.1),
        press: isDark ? adjustLightness(n[10], -0.06) : adjustLightness(n[11], 0.16),
        foreground: isDark ? n[0] : WHITE,
      }
    : solid(pick(input.primary)[8], darkText)
  const primaryScale = input.monochrome ? n : pick(input.primary)
  const secondary = pick(input.secondary)
  const accent = pick(input.accent)
  const destructive = solid(pick(input.destructive)[8], darkText)
  const destructiveScale = pick(input.destructive)
  const success = status(pick(input.success), darkText)
  const warning = status(pick(input.warning), darkText)
  const error = status(pick(input.error), darkText)
  const info = status(pick(input.info), darkText)

  const background = isDark ? n[0] : WHITE
  const surface = isDark ? n[1] : WHITE

  const values: ThemeValues = {
    background,
    backgroundHover: isDark ? n[2] : n[1],
    backgroundPress: isDark ? n[3] : n[2],
    backgroundFocus: isDark ? n[2] : n[1],
    backgroundStrong: isDark ? n[1] : n[1],
    backgroundTransparent: withAlpha(background, 0),
    color: n[11],
    colorHover: n[11],
    colorPress: n[10],
    colorFocus: n[11],
    colorTransparent: withAlpha(n[11], 0),
    borderColor: n[5],
    borderColorHover: n[7],
    borderColorPress: n[7],
    borderColorFocus: primary.base,
    placeholderColor: n[9],
    outlineColor: primary.base,
    shadowColor: isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(16, 24, 40, 0.08)',
    shadowColorStrong: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(16, 24, 40, 0.18)',
    color1: n[0],
    color2: n[1],
    color3: n[2],
    color4: n[3],
    color5: n[4],
    color6: n[5],
    color7: n[6],
    color8: n[7],
    color9: n[8],
    color10: n[9],
    color11: n[10],
    color12: n[11],

    foreground: n[11],
    muted: isDark ? n[2] : n[1],
    mutedForeground: ensureContrast(n[10], isDark ? n[1] : n[1]),
    card: surface,
    cardForeground: n[11],
    popover: surface,
    popoverForeground: n[11],
    overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(9, 9, 11, 0.5)',

    border: n[5],
    borderStrong: n[6],
    input: n[6],
    ring: primary.base,

    primary: primary.base,
    primaryHover: primary.hover,
    primaryPress: primary.press,
    primaryForeground: primary.foreground,
    primaryText: input.monochrome ? n[11] : ensureContrast(primaryScale[10], background),
    // The other mode's text step reads on the inverted surface.
    inversePrimary: input.monochrome
      ? background
      : ensureContrast(resolveScale(input.primary)[isDark ? 'light' : 'dark'][10], n[11]),
    primarySoft: primaryScale[2],
    primarySoftHover: primaryScale[3],
    primarySoftForeground: ensureContrast(primaryScale[10], primaryScale[3]),
    secondary: secondary[2],
    secondaryHover: secondary[3],
    secondaryPress: secondary[4],
    secondaryForeground: ensureContrast(secondary[11], secondary[4]),
    accent: accent[2],
    accentHover: accent[3],
    accentForeground: ensureContrast(accent[11], accent[3]),

    destructive: destructive.base,
    destructiveHover: destructive.hover,
    destructivePress: destructive.press,
    destructiveForeground: destructive.foreground,
    destructiveSoft: destructiveScale[2],
    destructiveSoftForeground: ensureContrast(destructiveScale[10], destructiveScale[3]),
    success: success.solid,
    successForeground: success.foreground,
    successSoft: success.soft,
    successSoftForeground: success.softForeground,
    successBorder: success.border,
    warning: warning.solid,
    warningForeground: warning.foreground,
    warningSoft: warning.soft,
    warningSoftForeground: warning.softForeground,
    warningBorder: warning.border,
    error: error.solid,
    errorForeground: error.foreground,
    errorSoft: error.soft,
    errorSoftForeground: error.softForeground,
    errorBorder: error.border,
    info: info.solid,
    infoForeground: info.foreground,
    infoSoft: info.soft,
    infoSoftForeground: info.softForeground,
    infoBorder: info.border,

    ...chartColors(mode),
  }

  return values
}

export const defaultThemeColors: Required<Omit<ThemeColorsInput, 'overrides'>> = {
  primary: 'indigo',
  secondary: 'slate',
  accent: 'slate',
  neutral: 'slate',
  destructive: 'red',
  success: 'green',
  warning: 'amber',
  error: 'red',
  info: 'blue',
  monochrome: false,
}

/**
 * Generates the light and dark theme objects, with their primary and inverse
 * sub-themes. Missing `secondary`/`accent` fall back to the neutral scale so a
 * single `primary` is enough to brand an app.
 */
export function createThemeColors(input: ThemeColorsInput = {}): GeneratedThemes {
  const neutral = input.neutral ?? defaultThemeColors.neutral
  const resolved = {
    ...defaultThemeColors,
    secondary: neutral,
    accent: neutral,
    ...stripUndefined(input),
    neutral,
  } as Required<Omit<ThemeColorsInput, 'overrides'>>

  return withSubThemes({
    light: { ...buildMode('light', resolved), ...input.overrides?.light },
    dark: { ...buildMode('dark', resolved), ...input.overrides?.dark },
  })
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([key, v]) => v !== undefined && key !== 'overrides'),
  ) as Partial<T>
}

export type { ColorScale }
