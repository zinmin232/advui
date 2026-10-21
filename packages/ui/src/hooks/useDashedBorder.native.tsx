import { StyleSheet, View } from 'react-native'
import { getTokenValue, useTheme } from 'tamagui/unstyled'
import type { DashedBorder } from './useDashedBorder'

const none: DashedBorder = { frame: undefined, overlay: null }

/**
 * Android dashes a rounded border only when it has `borderWidth` and
 * `borderColor` for all sides. Tamagui splits both into per-side props on
 * native, its `style` prop included since Tamagui 3, and Android draws those
 * solid. So the frame's own border turns transparent (it keeps its width, and
 * the layout) and a plain React Native view on top draws the dashes, in
 * `color` from the theme with the frame's `radius`. `null` draws none.
 */
export function useDashedBorder(color: string | null, radius: string): DashedBorder {
  const theme = useTheme()
  if (color === null) return none
  const name = color.startsWith('$') ? color.slice(1) : color
  const variable = theme[name as keyof typeof theme] as { val: string } | undefined
  const borderRadius = getTokenValue(radius as never, 'radius') as number | undefined
  return {
    frame: { borderColor: 'transparent' },
    overlay: (
      <View
        pointerEvents="none"
        // Over the frame's 1px border, which the absolute fill sits inside.
        style={[
          StyleSheet.absoluteFill,
          {
            top: -1,
            right: -1,
            bottom: -1,
            left: -1,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: variable?.val,
            borderRadius,
          },
        ]}
      />
    ),
  }
}
