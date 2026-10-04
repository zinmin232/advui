import { contrastRatio, mix, withAlpha } from '@advui/utils'
import type { ThemeValues } from './themes'

/**
 * The light and dark themes every Adv UI config has. These are type aliases,
 * not interfaces, because Tamagui's config needs an index signature.
 */
export type ModeThemes = {
  light: ThemeValues
  dark: ThemeValues
}

/**
 * Sub-themes for surfaces that change the text color under them. Tamagui
 * resolves `<Theme name="primary">` to `light_primary` or `dark_primary`, so
 * the children of a primary or inverse Section stay readable in both modes,
 * including during SSR.
 */
export type SubThemes = {
  /** Content on a `$primary` surface, such as a call-to-action band. */
  light_primary: ThemeValues
  dark_primary: ThemeValues
  /** Content on the other mode's surface: dark in light mode, light in dark mode. */
  light_inverse: ThemeValues
  dark_inverse: ThemeValues
}

/**
 * The furthest mix of `from` toward `to`, up to `max`, that keeps 4.5:1
 * against every color in `against` (`from` itself when no step does). Moving
 * along the mix keeps the hue, and unlike `ensureContrast` it works on
 * mid-tone brand colors whichever way the text goes.
 */
function furthest(from: string, to: string, max: number, against: string[]) {
  for (let amount = max; amount > 0; amount -= 0.01) {
    const color = mix(from, to, amount)
    if (against.every((other) => contrastRatio(other, color) >= 4.5)) return color
  }
  return from
}

/**
 * A theme for content on `t.primary`: its text is `primaryForeground`, raised
 * surfaces and borders are mixed toward it, and a primary button inverts
 * (foreground-colored fill, primary-colored text). Every text pair keeps
 * WCAG AA contrast, because `primaryForeground` already does on `primary`.
 */
export function primarySurfaceTheme(t: ThemeValues): ThemeValues {
  const surface = t.primary
  const text = t.primaryForeground
  // Cards on the band are a step toward the text, as long as the text still reads on them.
  const raised = furthest(surface, text, 0.12, [text])
  // Muted text is a step toward the band, readable on the band and on cards.
  const muted = furthest(text, surface, 0.3, [surface, raised])
  const line = mix(surface, text, 0.35)
  return {
    ...t,
    background: surface,
    backgroundHover: t.primaryHover,
    backgroundPress: t.primaryPress,
    backgroundFocus: t.primaryHover,
    backgroundStrong: t.primaryPress,
    backgroundTransparent: withAlpha(surface, 0),
    color: text,
    colorHover: text,
    colorPress: muted,
    colorFocus: text,
    colorTransparent: withAlpha(text, 0),
    borderColor: line,
    borderColorHover: mix(surface, text, 0.5),
    borderColorPress: mix(surface, text, 0.5),
    borderColorFocus: text,
    placeholderColor: muted,
    outlineColor: text,

    foreground: text,
    muted: raised,
    mutedForeground: muted,
    card: raised,
    cardForeground: text,
    border: line,
    borderStrong: mix(surface, text, 0.5),
    input: mix(surface, text, 0.5),
    ring: text,

    primary: text,
    primaryHover: mix(text, surface, 0.1),
    primaryPress: mix(text, surface, 0.18),
    primaryForeground: surface,
    primaryText: text,
    inversePrimary: surface,
    primarySoft: raised,
    primarySoftHover: mix(surface, text, 0.2),
    primarySoftForeground: text,
  }
}

/** Adds the primary and inverse sub-themes to a pair of light and dark themes. */
export function withSubThemes<T extends ModeThemes>(themes: T): T & SubThemes {
  return {
    light_primary: primarySurfaceTheme(themes.light),
    dark_primary: primarySurfaceTheme(themes.dark),
    light_inverse: themes.dark,
    dark_inverse: themes.light,
    // Sub-themes passed in win, so an app can design its own.
    ...themes,
  }
}
