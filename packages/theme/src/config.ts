import type { InferTamaguiConfig } from '@tamagui/web'
import { createTamagui } from 'tamagui'
import { animations } from './animations'
import { type FontFamilies, type FontScale, createUniversalFonts } from './fonts'
import { media, mediaQueryDefaultActive } from './media'
import { type ThemePresetName, themePresets } from './presets'
import { shorthands } from './shorthands'
import { type ModeThemes, type SubThemes, withSubThemes } from './subThemes'
import { type ThemeColorsInput, createThemeColors } from './themes'
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
  themes?: ModeThemes & Partial<SubThemes>
  /**
   * Android only: pressing a button, chip, tab or list row shows the native
   * ripple instead of darkening it. `material()` turns it on. Default: false.
   */
  androidRipple?: boolean
}

/** Adv UI settings that are not Tamagui's, such as `androidRipple`. */
export interface UniversalSettings {
  androidRipple: boolean
}

const defaultSettings: UniversalSettings = { androidRipple: false }

/** The Adv UI settings stored on a config from `createUniversalConfig()`. */
export function getUniversalSettings(config: object): UniversalSettings {
  return (config as { advui?: UniversalSettings }).advui ?? defaultSettings
}

/** What `createUniversalConfig` hands to Tamagui's `createTamagui`. */
function createProps(options: UniversalConfigOptions) {
  const { preset = 'indigo', colors, radius = 'md', fontScale = 'default', fonts } = options
  // Hand-made light and dark themes get the primary and inverse sub-themes too.
  const themes = options.themes
    ? withSubThemes(options.themes)
    : createThemeColors({ ...themePresets[preset].colors, ...colors })
  return {
    tokens: createUniversalTokens({ radius }),
    themes,
    fonts: createUniversalFonts({ scale: fontScale, families: fonts }),
    media,
    shorthands,
    animations,
    settings: {
      selectionStyles: (theme: Record<string, string>) =>
        theme.primarySoft ? { backgroundColor: theme.primarySoft, color: theme.foreground } : null,
      defaultFont: 'body',
      mediaQueryDefaultActive,
      fastSchemeChange: true,
      shouldAddPrefersColorThemes: true,
      addThemeClassName: 'html',
      allowedStyleValues: 'somewhat-strict-web',
      onlyAllowShorthands: false,
      styleCompat: 'web',
    },
  } as const
}

/**
 * The config `createUniversalConfig` returns. Named, not inferred: Tamagui 3's
 * inferred config type refers to types it does not export, so declaration
 * files could not name it.
 */
export type UniversalConfig = InferTamaguiConfig<ReturnType<typeof createProps>> & {
  advui: UniversalSettings
}

/**
 * Builds a complete Tamagui config (tokens, light/dark themes, fonts, media
 * queries, animations). Call once at app startup and pass to `UniversalProvider`.
 *
 * @example
 * export const config = createUniversalConfig({ preset: 'violet', radius: 'lg' })
 */
export function createUniversalConfig(options: UniversalConfigOptions = {}): UniversalConfig {
  const config = createTamagui(createProps(options))
  // Stored on the config object, which components reach from anywhere with
  // getConfig(), including native portals that do not carry React context.
  const advui: UniversalSettings = { androidRipple: options.androidRipple ?? false }
  return Object.assign(config, { advui })
}
