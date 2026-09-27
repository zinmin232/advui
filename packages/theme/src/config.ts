import { createTamagui } from 'tamagui'
import { animations } from './animations'
import { type FontFamilies, type FontScale, createUniversalFonts } from './fonts'
import { media, mediaQueryDefaultActive } from './media'
import { type ThemePresetName, themePresets } from './presets'
import { shorthands } from './shorthands'
import { type GeneratedThemes, type ThemeColorsInput, createThemeColors } from './themes'
import { type RadiusInput, createUniversalTokens } from './tokens'

export interface UniversalConfigOptions {
  /** Starting color preset. Individual `colors` win over the preset. Default: `indigo`. */
  preset?: ThemePresetName
  /** Brand and intent colors — scale names (`'violet'`) or any color string (`'#6366f1'`). */
  colors?: ThemeColorsInput
  /**
   * Corner roundness for every component: a scale name or base in px (default
   * `md`, 8px), or exact values per token, e.g. `{ button: 9999 }`.
   */
  radius?: RadiusInput
  /** Global type scale. Default: `default`. */
  fontScale?: FontScale | number
  fonts?: FontFamilies
  /**
   * Complete light and dark themes, e.g. from `material()` in
   * `@advui/theme/material`. Replaces `preset` and `colors`.
   */
  themes?: GeneratedThemes
}

/**
 * Builds a complete Tamagui config (tokens, light/dark themes, fonts, media
 * queries, animations). Call once at app startup and pass to `UniversalProvider`.
 *
 * @example
 * export const config = createUniversalConfig({ preset: 'violet', radius: 'lg' })
 */
export function createUniversalConfig(options: UniversalConfigOptions = {}) {
  const { preset = 'indigo', colors, radius = 'md', fontScale = 'default', fonts } = options
  const themes = options.themes ?? createThemeColors({ ...themePresets[preset].colors, ...colors })

  return createTamagui({
    tokens: createUniversalTokens({ radius }),
    themes,
    fonts: createUniversalFonts({ scale: fontScale, families: fonts }),
    media,
    shorthands,
    animations,
    selectionStyles: (theme) =>
      theme.primarySoft ? { backgroundColor: theme.primarySoft, color: theme.foreground } : null,
    settings: {
      defaultFont: 'body',
      mediaQueryDefaultActive,
      fastSchemeChange: true,
      shouldAddPrefersColorThemes: true,
      addThemeClassName: 'html',
      allowedStyleValues: 'somewhat-strict-web',
      onlyAllowShorthands: false,
      styleCompat: 'web',
    },
  })
}

export type UniversalConfig = ReturnType<typeof createUniversalConfig>
