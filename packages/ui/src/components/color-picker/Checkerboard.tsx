import { View } from 'tamagui/unstyled'
import { CHECKER, CHECKER_CELL } from './shared'

/** The grid behind translucent colors. Web: a repeating CSS gradient. */
export function Checkerboard() {
  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="white"
      pointerEvents="none"
      style={{
            backgroundImage: `repeating-conic-gradient(${CHECKER} 0% 25%, transparent 0% 50%)`,
            backgroundSize: `${CHECKER_CELL * 2}px ${CHECKER_CELL * 2}px`,
          }}
    />
  )
}
