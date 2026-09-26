import { isWeb, useTheme } from 'tamagui'

/**
 * Resolves a theme token (`$primary`) to a value usable by SVG. On web we keep
 * the CSS variable so the icon follows light/dark switches without a re-render.
 */
export function useIconColor(color: string | undefined): string | undefined {
  const theme = useTheme()
  if (!color) return undefined
  if (!color.startsWith('$')) return color
  const variable = theme[color.slice(1) as keyof typeof theme] as
    { val: string; get: () => string } | undefined
  if (!variable) return color
  return isWeb ? variable.get() : variable.val
}
