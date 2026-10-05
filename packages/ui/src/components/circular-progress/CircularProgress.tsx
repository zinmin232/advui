import { useIconColor } from '@advui/icons'
import { Text, View, type ViewProps } from 'tamagui'
import {
  type CircularProgressSize,
  type CircularProgressTone,
  progressFraction,
  ring,
  toneColor,
  valueFontSize,
} from './geometry'
import { ariaState } from '../../utils/ariaState'

export interface CircularProgressProps extends Omit<ViewProps, 'children'> {
  /** Current value. Omit (or `null`) for a spinning, indeterminate ring. */
  value?: number | null
  max?: number
  /** `sm` 24px · `md` 40px · `lg` 64px. */
  size?: CircularProgressSize
  tone?: CircularProgressTone
  /** Accessible name, e.g. "Storage used". */
  label?: string
  /** Show the percentage in the middle (`md` and `lg`). */
  showValue?: boolean
}

/**
 * A ring that fills as a task completes, for tight spaces and dashboards.
 * Web: an SVG circle; the indeterminate ring spins with the spinner keyframes
 * in GlobalStyles.
 */
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

  return (
    <View
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped ?? undefined}
      aria-busy={ariaState(fraction === null)}
      width={geometry.diameter}
      height={geometry.diameter}
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <svg
        className={fraction === null ? 'aui-spinner' : undefined}
        width={geometry.diameter}
        height={geometry.diameter}
        viewBox={`0 0 ${geometry.diameter} ${geometry.diameter}`}
        fill="none"
        aria-hidden
        // Start the ring at 12 o'clock.
        style={{ display: 'block', transform: fraction === null ? undefined : 'rotate(-90deg)' }}
      >
        <circle
          cx={geometry.center}
          cy={geometry.center}
          r={geometry.radius}
          stroke={track}
          strokeWidth={geometry.stroke}
        />
        {geometry.visible ? (
          <circle
            cx={geometry.center}
            cy={geometry.center}
            r={geometry.radius}
            stroke={indicator}
            strokeWidth={geometry.stroke}
            strokeLinecap="round"
            strokeDasharray={geometry.circumference}
            strokeDashoffset={geometry.offset}
            style={{ transition: 'stroke-dashoffset 300ms ease-out' }}
          />
        ) : null}
      </svg>
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
