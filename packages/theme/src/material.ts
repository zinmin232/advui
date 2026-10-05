/**
 * Material 3 for Adv UI: color roles generated from one seed color with
 * Google's material-color-utilities (the algorithm behind Android dynamic
 * color), plus Material's shape scale and fonts. It lives in its own entry,
 * `@advui/theme/material`, so apps that do not use it never ship the library.
 *
 * Material roles are mapped onto Adv UI's roles, so every component works
 * unchanged: `primaryContainer` → `$primarySoft`, `secondaryContainer` →
 * `$secondary` (Material's tonal button), `outline` → `$input`, and so on.
 */
import {
  type DynamicScheme,
  Hct,
  SchemeTonalSpot,
  argbFromHex,
  customColor,
  hexFromArgb,
} from '@material/material-color-utilities'
import { ensureContrast, parseColor, toHex, withAlpha } from '@advui/utils'
import type { UniversalConfigOptions } from './config'
import type { FontFamilies } from './fonts'
import { chartColors } from './chart'
import { withSubThemes } from './subThemes'
import type { ColorMode, GeneratedThemes, ThemeValues } from './themes'
import type { RadiusOverrides } from './tokens'

/** Material's baseline purple, used when no seed is given. */
export const MATERIAL_BASELINE_SEED = '#6750A4'

export interface MaterialOptions {
  /** Seed color the whole palette is generated from. Default: Material baseline purple. */
  seed?: string
  /**
   * Status colors Material does not define. They are harmonized toward the
   * seed (a slight hue shift) so they sit well with it.
   */
  colors?: { success?: string; warning?: string; info?: string }
  /** Escape hatch: override any generated value per mode. */
  overrides?: Partial<Record<ColorMode, Partial<ThemeValues>>>
  /** Android: show the native ripple when something is pressed. Default: true. */
  androidRipple?: boolean
}

const defaultStatus = { success: '#2e7d32', warning: '#b26a00', info: '#0061a4' }

// Material state-layer opacities: hover 8%, focus and press 10%.
const HOVER = 0.08
const PRESS = 0.1

/** Paints `overlay` over `base` at `opacity`, like a Material state layer (sRGB). */
function layer(base: string, overlay: string, opacity: number): string {
  const b = parseColor(base)
  const o = parseColor(overlay)
  if (!b || !o) throw new Error(`Invalid color: ${!b ? base : overlay}`)
  const c = (x: number, y: number) => x * (1 - opacity) + y * opacity
  return toHex({ r: c(b.r, o.r), g: c(b.g, o.g), b: c(b.b, o.b), a: 1 })
}

// Neutral tones behind Tamagui's color1…color12 (lightest to strongest text).
const NEUTRAL_TONES = {
  light: [99, 98, 96, 94, 92, 90, 87, 80, 60, 50, 30, 10],
  dark: [6, 10, 12, 17, 22, 24, 30, 40, 60, 70, 80, 90],
} as const

function buildMode(
  s: DynamicScheme,
  mode: ColorMode,
  status: Record<'success' | 'warning' | 'info', ReturnType<typeof customColor>>,
): ThemeValues {
  const hex = hexFromArgb
  const isDark = mode === 'dark'
  const surface = hex(s.surface)
  const onSurface = hex(s.onSurface)
  const popover = hex(s.surfaceContainerHigh)
  const muted = hex(s.surfaceContainerHigh)
  const tone = (step: number) => hex(s.neutralPalette.tone(NEUTRAL_TONES[mode][step]!))

  const primary = hex(s.primary)
  const onPrimary = hex(s.onPrimary)
  const primaryContainer = hex(s.primaryContainer)
  const onPrimaryContainer = hex(s.onPrimaryContainer)
  const secondaryContainer = hex(s.secondaryContainer)
  const onSecondaryContainer = hex(s.onSecondaryContainer)
  const error = hex(s.error)
  const onError = hex(s.onError)
  const errorContainer = hex(s.errorContainer)
  const onErrorContainer = hex(s.onErrorContainer)
  const outline = hex(s.outline)
  const outlineVariant = hex(s.outlineVariant)

  const intent = (group: ReturnType<typeof customColor>) => {
    const g = isDark ? group.dark : group.light
    return {
      solid: hex(g.color),
      foreground: hex(g.onColor),
      soft: hex(g.colorContainer),
      softForeground: ensureContrast(hex(g.onColorContainer), hex(g.colorContainer)),
      border: layer(hex(g.colorContainer), hex(g.color), 0.35),
    }
  }
  const success = intent(status.success)
  const warning = intent(status.warning)
  const info = intent(status.info)

  return {
    background: surface,
    backgroundHover: layer(surface, onSurface, HOVER),
    backgroundPress: layer(surface, onSurface, PRESS),
    backgroundFocus: layer(surface, onSurface, PRESS),
    backgroundStrong: hex(s.surfaceContainer),
    backgroundTransparent: withAlpha(surface, 0),
    color: onSurface,
    colorHover: onSurface,
    colorPress: hex(s.onSurfaceVariant),
    colorFocus: onSurface,
    colorTransparent: withAlpha(onSurface, 0),
    borderColor: outlineVariant,
    borderColorHover: outline,
    borderColorPress: outline,
    borderColorFocus: primary,
    placeholderColor: hex(s.onSurfaceVariant),
    outlineColor: primary,
    shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.12)',
    shadowColorStrong: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.24)',
    color1: tone(0),
    color2: tone(1),
    color3: tone(2),
    color4: tone(3),
    color5: tone(4),
    color6: tone(5),
    color7: tone(6),
    color8: tone(7),
    color9: tone(8),
    color10: tone(9),
    color11: tone(10),
    color12: tone(11),

    foreground: onSurface,
    muted,
    mutedForeground: ensureContrast(hex(s.onSurfaceVariant), muted),
    card: hex(s.surfaceContainerLow),
    cardForeground: onSurface,
    popover,
    popoverForeground: onSurface,
    overlay: withAlpha(hex(s.scrim), 0.32),

    border: outlineVariant,
    borderStrong: outline,
    input: outline,
    ring: primary,

    primary,
    primaryHover: layer(primary, onPrimary, HOVER),
    primaryPress: layer(primary, onPrimary, PRESS),
    primaryForeground: onPrimary,
    primaryText: ensureContrast(primary, surface),
    inversePrimary: ensureContrast(hex(s.inversePrimary), onSurface),
    primarySoft: primaryContainer,
    primarySoftHover: layer(primaryContainer, onPrimaryContainer, HOVER),
    primarySoftForeground: onPrimaryContainer,
    // Material's tonal button.
    secondary: secondaryContainer,
    secondaryHover: layer(secondaryContainer, onSecondaryContainer, HOVER),
    secondaryPress: layer(secondaryContainer, onSecondaryContainer, PRESS),
    secondaryForeground: onSecondaryContainer,
    // Hover highlight for menu items and ghost buttons: a state layer over the
    // menu surface, so it reads on both the page and the menu.
    accent: layer(popover, onSurface, HOVER),
    accentHover: layer(popover, onSurface, 0.12),
    accentForeground: onSurface,

    destructive: error,
    destructiveHover: layer(error, onError, HOVER),
    destructivePress: layer(error, onError, PRESS),
    destructiveForeground: onError,
    destructiveSoft: errorContainer,
    destructiveSoftForeground: onErrorContainer,
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
    error,
    errorForeground: onError,
    errorSoft: errorContainer,
    errorSoftForeground: onErrorContainer,
    errorBorder: layer(errorContainer, error, 0.35),
    info: info.solid,
    infoForeground: info.foreground,
    infoSoft: info.soft,
    infoSoftForeground: info.softForeground,
    infoBorder: info.border,

    ...chartColors(mode),
  }
}

/**
 * Light and dark themes with Material 3 color roles (the "tonal spot" scheme
 * Android uses for dynamic color), generated from `seed`.
 */
export function createMaterialThemes(options: MaterialOptions = {}): GeneratedThemes {
  const seed = options.seed ?? MATERIAL_BASELINE_SEED
  const source = argbFromHex(toHex(seed))
  const colors = { ...defaultStatus, ...options.colors }
  const status = {
    success: customColor(source, {
      name: 'success',
      value: argbFromHex(colors.success),
      blend: true,
    }),
    warning: customColor(source, {
      name: 'warning',
      value: argbFromHex(colors.warning),
      blend: true,
    }),
    info: customColor(source, { name: 'info', value: argbFromHex(colors.info), blend: true }),
  }
  const scheme = (isDark: boolean) => new SchemeTonalSpot(Hct.fromInt(source), isDark, 0)
  return withSubThemes({
    light: { ...buildMode(scheme(false), 'light', status), ...options.overrides?.light },
    dark: { ...buildMode(scheme(true), 'dark', status), ...options.overrides?.dark },
  })
}

/**
 * Material 3 shape scale on Adv UI's radius tokens: pill buttons, 4px fields,
 * 12px cards and 28px dialogs and sheets.
 */
export const materialShape: RadiusOverrides = {
  xs: 2,
  sm: 4,
  md: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 28,
  button: 9999,
  buttonLg: 9999,
  dialog: 28,
}

const roboto =
  'Roboto, "Roboto Flex", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif'

/** Roboto on web (load it in your app); the platform font on iOS and Android. */
export const materialFonts: FontFamilies = { body: roboto, heading: roboto }

/**
 * Options for `createUniversalConfig` that give every component the Material 3
 * look: color roles from `seed`, Material's shapes, Roboto and, on Android,
 * the press ripple.
 *
 * @example
 * import { createUniversalConfig } from '@advui/theme'
 * import { material } from '@advui/theme/material'
 *
 * export const config = createUniversalConfig(material({ seed: '#6750A4' }))
 */
export function material(options: MaterialOptions = {}): UniversalConfigOptions {
  return {
    themes: createMaterialThemes(options),
    radius: materialShape,
    fonts: materialFonts,
    androidRipple: options.androidRipple ?? true,
  }
}
