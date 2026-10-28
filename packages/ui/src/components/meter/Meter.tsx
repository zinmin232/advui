import { forwardRef } from 'react'
import { type GetProps, type TamaguiElement, View, isWeb, styled } from 'tamagui/unstyled'

const MeterTrack = styled(View, {
  displayName: 'Meter',
  width: '100%',
  overflow: 'hidden',
  backgroundColor: 'muted',
  borderRadius: 'full',
  variants: {
    size: {
      sm: {
        height: '1',
      },
      md: {
        height: '2',
      },
      lg: {
        height: '3',
      },
    },
  } as const,
  defaultVariants: { size: 'md' },
})

const MeterIndicator = styled(View, {
  displayName: 'MeterIndicator',
  height: '100%',
  borderRadius: 'full',
  transition: 'medium',
  variants: {
    tone: {
      primary: {
        backgroundColor: 'primary',
      },
      success: {
        backgroundColor: 'success',
      },
      warning: {
        backgroundColor: 'warning',
      },
      error: {
        backgroundColor: 'error',
      },
    },
  } as const,
  defaultVariants: { tone: 'primary' },
})

export type MeterTone = NonNullable<GetProps<typeof MeterIndicator>['tone']>

export interface MeterProps extends Omit<GetProps<typeof MeterTrack>, 'children'> {
  /** The measured value, clamped between `min` and `max`. */
  value: number
  min?: number
  max?: number
  /** Values below this are low. Give `low`, `high` or `optimum` to color by range. */
  low?: number
  /** Values above this are high. */
  high?: number
  /** The best value: its range is `success`, the next `warning`, the far one `error`. */
  optimum?: number
  /** Overrides the color the ranges give. */
  tone?: MeterTone
  /** Accessible name, e.g. "Storage used". */
  label?: string
  /** What a screen reader reads for the value, e.g. "7.2 of 10 GB". */
  valueText?: string
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/**
 * The color of a value by its range, as the HTML `meter` element does it: the
 * range that holds `optimum` is good, the middle is fair next to it, and the
 * other end is bad.
 */
export function meterTone({
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
}: Pick<MeterProps, 'value' | 'min' | 'max' | 'low' | 'high' | 'optimum'>): MeterTone {
  if (low === undefined && high === undefined && optimum === undefined) return 'primary'
  const lowEdge = clamp(low ?? min, min, max)
  const highEdge = clamp(high ?? max, lowEdge, max)
  const range = (n: number) => (n < lowEdge ? 'low' : n > highEdge ? 'high' : 'middle')
  const best = range(clamp(optimum ?? (min + max) / 2, min, max))
  const current = range(clamp(value, min, max))
  if (current === best) return 'success'
  if (best === 'middle' || current === 'middle') return 'warning'
  return 'error'
}

/** A value inside a known range, such as storage used or battery left, with `meter` semantics. */
export const Meter = forwardRef<TamaguiElement, MeterProps>(function Meter(
  { value, min = 0, max = 100, low, high, optimum, tone, label, valueText, ...props },
  ref,
) {
  const clamped = clamp(value, min, Math.max(min, max))
  // An empty range (max equal to min) is empty, not NaN.
  const percent = max > min ? ((clamped - min) / (max - min)) * 100 : 0
  return (
    <MeterTrack
      ref={ref}
      role="meter"
      // Android reads a value only as text (see CircularProgress.native.tsx).
      {...(isWeb ? null : { accessible: true })}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={valueText ?? (isWeb ? undefined : `${Math.round(percent)}%`)}
      {...props}
    >
      <MeterIndicator
        tone={tone ?? meterTone({ value, min, max, low, high, optimum })}
        width={`${percent}%`}
      />
    </MeterTrack>
  )
})
