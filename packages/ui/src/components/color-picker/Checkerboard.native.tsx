import { useId } from 'react'
import Svg, { Defs, Pattern, Rect } from 'react-native-svg'
import { View } from 'tamagui'
import { CHECKER, CHECKER_CELL } from './shared'

/**
 * The grid behind translucent colors. Native: an SVG pattern, since React
 * Native backgrounds do not repeat.
 */
export function Checkerboard() {
  // useId's colons are not valid in a url(#id) reference.
  const id = `checker${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const cell = CHECKER_CELL
  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="$white"
      pointerEvents="none"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={id} width={cell * 2} height={cell * 2} patternUnits="userSpaceOnUse">
            <Rect width={cell} height={cell} fill={CHECKER} />
            <Rect x={cell} y={cell} width={cell} height={cell} fill={CHECKER} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  )
}
