import type { ViewStyle } from 'react-native'
import { useTheme } from 'tamagui/unstyled'

/**
 * Android dashes a rounded border only when it has `borderWidth` and
 * `borderColor` for all sides. Tamagui splits both into per-side props on
 * native, which Android draws solid, so a dashed frame also gets them as a
 * style, in `color` from the theme. `null` (no dashed border) returns none.
 */
export function useDashedBorder(color: string | null): ViewStyle | undefined {
  const theme = useTheme()
  if (color === null) return undefined
  const name = color.startsWith('$') ? color.slice(1) : color
  const variable = theme[name as keyof typeof theme] as { val: string } | undefined
  return { borderWidth: 1, borderStyle: 'dashed', borderColor: variable?.val }
}
