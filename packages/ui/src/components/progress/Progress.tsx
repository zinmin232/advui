import { type GetProps, View, isWeb, styled } from 'tamagui'

const Track = styled(View, {
  name: 'Progress',
  width: '100%',
  overflow: 'hidden',
  backgroundColor: '$muted',
  borderRadius: '$full',

  variants: {
    size: {
      sm: { height: '$1' },
      md: { height: '$2' },
      lg: { height: '$3' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const Indicator = styled(View, {
  name: 'ProgressIndicator',
  height: '100%',
  borderRadius: '$full',
  transition: 'medium',

  variants: {
    tone: {
      primary: { backgroundColor: '$primary' },
      success: { backgroundColor: '$success' },
      warning: { backgroundColor: '$warning' },
      error: { backgroundColor: '$error' },
    },
  } as const,

  defaultVariants: { tone: 'primary' },
})

export type ProgressProps = Omit<GetProps<typeof Track>, 'children'> & {
  /** Current value. Omit (or `null`) for an indeterminate bar. */
  value?: number | null
  max?: number
  tone?: GetProps<typeof Indicator>['tone']
  /** Accessible name, e.g. "Upload progress". */
  label?: string
}

/** Determinate progress bar exposing `progressbar` semantics with min/max/now values. */
export function Progress({
  value = null,
  max = 100,
  tone = 'primary',
  label,
  ...props
}: ProgressProps) {
  const clamped = value === null ? null : Math.min(max, Math.max(0, value))
  const percent = clamped === null ? 35 : (clamped / max) * 100
  return (
    <Track
      role="progressbar"
      {...(isWeb ? null : { accessible: true })}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped ?? undefined}
      {...props}
    >
      <Indicator tone={tone} width={`${percent}%`} opacity={clamped === null ? 0.6 : 1} />
    </Track>
  )
}
