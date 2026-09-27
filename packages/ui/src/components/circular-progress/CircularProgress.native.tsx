import { useIconColor } from '@advui/icons'
import { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { Text, View } from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { CircularProgressProps } from './CircularProgress'
import { progressFraction, ring, toneColor, valueFontSize } from './geometry'

// One turn, like the web spinner keyframes; slower when motion is reduced, as
// a loading indicator still has to show it is busy.
const TURN_MS = 800
const REDUCED_TURN_MS = 1600

/** Native: react-native-svg, with an Animated rotation for the indeterminate ring. */
export function CircularProgress({
  value = null,
  max = 100,
  size = 'md',
  tone = 'primary',
  label,
  showValue = false,
  ...props
}: CircularProgressProps) {
  const { clamped, fraction } = progressFraction(value, max)
  const geometry = ring(size, fraction)
  const indicator = useIconColor(toneColor[tone])
  const track = useIconColor('$muted')
  const fontSize = valueFontSize[size]
  const reducedMotion = useReducedMotion()
  const spin = useRef(new Animated.Value(0)).current
  const spinning = fraction === null

  useEffect(() => {
    if (!spinning) return
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: reducedMotion ? REDUCED_TURN_MS : TURN_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => {
      loop.stop()
      spin.setValue(0)
    }
  }, [spin, spinning, reducedMotion])

  const rotate = spinning
    ? spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
    : // Start the ring at 12 o'clock.
      '-90deg'

  return (
    <View
      accessible
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped ?? undefined}
      aria-busy={spinning || undefined}
      width={geometry.diameter}
      height={geometry.diameter}
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg
          width={geometry.diameter}
          height={geometry.diameter}
          viewBox={`0 0 ${geometry.diameter} ${geometry.diameter}`}
          fill="none"
          importantForAccessibility="no-hide-descendants"
        >
          <Circle
            cx={geometry.center}
            cy={geometry.center}
            r={geometry.radius}
            stroke={track}
            strokeWidth={geometry.stroke}
          />
          {geometry.visible ? (
            <Circle
              cx={geometry.center}
              cy={geometry.center}
              r={geometry.radius}
              stroke={indicator}
              strokeWidth={geometry.stroke}
              strokeLinecap="round"
              strokeDasharray={geometry.circumference}
              strokeDashoffset={geometry.offset}
            />
          ) : null}
        </Svg>
      </Animated.View>
      {showValue && fontSize && fraction !== null ? (
        <Text
          aria-hidden
          position="absolute"
          fontFamily="$body"
          fontSize={fontSize}
          lineHeight={fontSize}
          fontWeight="600"
          color="$foreground"
        >
          {Math.round(fraction * 100)}%
        </Text>
      ) : null}
    </View>
  )
}

export type { CircularProgressProps }
