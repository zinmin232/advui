'use client'

import { updateTheme } from '@tamagui/theme'
import {
  type FontScale,
  type RadiusScale,
  type ThemeColorsInput,
  type ThemePresetName,
  createRadius,
  createThemeColors,
  createUniversalFonts,
  themePresets,
} from '@advui/theme'
import {
  MATERIAL_BASELINE_SEED,
  createMaterialThemes,
  materialFonts,
  materialShape,
} from '@advui/theme/material'
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export type DesignStyle = 'advui' | 'material'

export interface CustomTheme {
  /** `material`: Material 3 roles from `primary` (the seed), shapes and fonts. */
  style: DesignStyle
  preset: ThemePresetName
  primary?: string
  secondary?: string
  accent?: string
  radius: RadiusScale
  fontScale: FontScale
}

export const defaultCustomTheme: CustomTheme = {
  style: 'advui',
  preset: 'indigo',
  radius: 'md',
  fontScale: 'default',
}

const STORAGE_KEY = 'aui-custom-theme'
const STYLE_ID = 'aui-customizer-tokens'

export function themeColorsInput(theme: CustomTheme): ThemeColorsInput {
  return {
    ...themePresets[theme.preset].colors,
    ...(theme.primary ? { primary: theme.primary, monochrome: false } : null),
    ...(theme.secondary ? { secondary: theme.secondary } : null),
    ...(theme.accent ? { accent: theme.accent } : null),
  }
}

/** Light and dark themes for the current settings. */
export function generateThemes(theme: CustomTheme) {
  return theme.style === 'material'
    ? createMaterialThemes({ seed: theme.primary ?? MATERIAL_BASELINE_SEED })
    : createThemeColors(themeColorsInput(theme))
}

/** Code users can paste into their app to reproduce the current look. */
export function themeToCode(theme: CustomTheme): string {
  if (theme.style === 'material') {
    return `import { createUniversalConfig } from '@advui/theme'
import { material } from '@advui/theme/material'

export const config = createUniversalConfig({
  ...material({ seed: '${theme.primary ?? MATERIAL_BASELINE_SEED}' }),
  fontScale: '${theme.fontScale}',
})
`
  }
  const colors = [
    theme.primary && `primary: '${theme.primary}'`,
    theme.secondary && `secondary: '${theme.secondary}'`,
    theme.accent && `accent: '${theme.accent}'`,
  ].filter(Boolean)
  const lines = [
    `  preset: '${theme.preset}',`,
    colors.length ? `  colors: { ${colors.join(', ')} },` : null,
    `  radius: '${theme.radius}',`,
    `  fontScale: '${theme.fontScale}',`,
  ].filter(Boolean)
  return `import { createUniversalConfig } from '@advui/theme'

export const config = createUniversalConfig({
${lines.join('\n')}
})
`
}

const toPx = (value: unknown) =>
  `${typeof value === 'object' && value && 'val' in value ? (value as { val: number }).val : value}px`

/** Radius and font tokens are CSS variables on web, so they can be swapped live. */
function tokenCss(theme: CustomTheme) {
  const material = theme.style === 'material'
  const radius = createRadius(material ? materialShape : theme.radius)
  const radiusVars = Object.entries(radius)
    .map(([key, value]) => `--t-radius-${key}:${value}px`)
    .join(';')
  const fonts = createUniversalFonts({
    scale: theme.fontScale,
    families: material ? materialFonts : undefined,
  })
  const fontRules = Object.entries(fonts)
    .map(([name, font]) => {
      const sizes = Object.entries(font.size ?? {}).map(([k, v]) => `--f-size-${k}:${toPx(v)}`)
      const lineHeights = Object.entries(font.lineHeight ?? {}).map(
        ([k, v]) => `--f-lineHeight-${k}:${toPx(v)}`,
      )
      const family = font.family ? [`--f-family:${font.family}`] : []
      return `:root:root .font_${name}{${[...family, ...sizes, ...lineHeights].join(';')}}`
    })
    .join('\n')
  return `:root:root{${radiusVars}}\n${fontRules}`
}

function applyTheme(theme: CustomTheme) {
  // Light, dark and their primary and inverse sub-themes.
  for (const [name, values] of Object.entries(generateThemes(theme))) {
    updateTheme({ name, theme: values })
  }
  let style = document.getElementById(STYLE_ID)
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = tokenCss(theme)
}

interface ThemeStore {
  theme: CustomTheme
  isDefault: boolean
  setTheme: (patch: Partial<CustomTheme>) => void
  reset: () => void
}

const ThemeStoreContext = createContext<ThemeStore | null>(null)

export function ThemeStoreProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<CustomTheme>(defaultCustomTheme)
  const applied = useRef(false)

  // Restore the visitor's theme after hydration (per-visitor convenience only).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setThemeState({ ...defaultCustomTheme, ...(JSON.parse(stored) as CustomTheme) })
    } catch {
      // storage unavailable — keep defaults
    }
  }, [])

  const isDefault = useMemo(
    () => JSON.stringify(theme) === JSON.stringify(defaultCustomTheme),
    [theme],
  )

  useEffect(() => {
    // The default theme is already in the server-rendered CSS.
    if (isDefault && !applied.current) return
    applied.current = true
    applyTheme(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
    } catch {
      // ignore
    }
  }, [theme, isDefault])

  const setTheme = useCallback((patch: Partial<CustomTheme>) => {
    setThemeState((prev) => ({ ...prev, ...patch }))
  }, [])
  const reset = useCallback(() => setThemeState(defaultCustomTheme), [])

  const value = useMemo(
    () => ({ theme, isDefault, setTheme, reset }),
    [theme, isDefault, setTheme, reset],
  )
  return <ThemeStoreContext.Provider value={value}>{children}</ThemeStoreContext.Provider>
}

export function useThemeStore(): ThemeStore {
  const store = useContext(ThemeStoreContext)
  if (!store) throw new Error('useThemeStore must be used inside ThemeStoreProvider')
  return store
}
