import { IconDefaults, MinusIcon, TrendingUpIcon } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  VisuallyHidden,
  createStyledContext,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { Text, isTextContent } from '@advui/core'

export type StatSize = 'sm' | 'md' | 'lg'
export type StatTrend = 'up' | 'down' | 'neutral'
export type StatTone = 'positive' | 'negative' | 'neutral'

const StatContext = createStyledContext<{ size: StatSize }>({ size: 'md' })

const StatFrame = styled(View, {
  name: 'Stat',
  context: StatContext,
  flexDirection: 'column',
  minWidth: 0,

  variants: {
    size: {
      sm: { gap: '$0.5' },
      md: { gap: '$1' },
      lg: { gap: '$1.5' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const StatLabel = styled(Text, {
  name: 'StatLabel',
  context: StatContext,
  tone: 'muted',
  weight: 'medium',

  variants: {
    size: {
      sm: { fontSize: '$1', lineHeight: '$1' },
      md: { fontSize: '$2', lineHeight: '$2' },
      lg: { fontSize: '$3', lineHeight: '$3' },
    },
  } as const,
})

const StatValue = styled(Text, {
  name: 'StatValue',
  context: StatContext,
  fontFamily: '$heading',
  fontWeight: '700',

  variants: {
    size: {
      sm: { fontSize: '$5', lineHeight: '$5' },
      md: { fontSize: '$7', lineHeight: '$7' },
      lg: { fontSize: '$9', lineHeight: '$9' },
    },
  } as const,
})

const StatHelpText = styled(Text, {
  name: 'StatHelpText',
  context: StatContext,
  tone: 'muted',

  variants: {
    size: {
      sm: { fontSize: '$1', lineHeight: '$1' },
      md: { fontSize: '$1', lineHeight: '$1' },
      lg: { fontSize: '$2', lineHeight: '$2' },
    },
  } as const,
})

const StatDeltaFrame = styled(View, {
  name: 'StatDelta',
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: '$1',

  variants: {
    variant: {
      plain: {},
      badge: { paddingHorizontal: '$2', paddingVertical: '$0.5', borderRadius: '$full' },
    },
  } as const,
})

const tones = {
  positive: { text: 'success', badge: '$successSoft', icon: '$successSoftForeground' },
  negative: { text: 'error', badge: '$errorSoft', icon: '$errorSoftForeground' },
  neutral: { text: 'muted', badge: '$muted', icon: '$mutedForeground' },
} as const

const defaultTones: Record<StatTrend, StatTone> = {
  up: 'positive',
  down: 'negative',
  neutral: 'neutral',
}

const defaultTrendLabels: Record<StatTrend, string> = {
  up: 'Increased by',
  down: 'Decreased by',
  neutral: 'No change:',
}

export interface StatDeltaProps extends Omit<GetProps<typeof StatDeltaFrame>, 'children'> {
  /** Direction of the change; picks the arrow. */
  trend?: StatTrend
  /**
   * Whether the change is good or bad; picks the color. Defaults to
   * `positive` for `up` and `negative` for `down`. Pass it when a drop is
   * good news (costs, churn, response time).
   */
  tone?: StatTone
  /**
   * Read by screen readers before the value, since the arrow is hidden from
   * them. Default: "Increased by", "Decreased by" or "No change:".
   */
  trendLabel?: string
  /** The change, e.g. `12.5%` or `+320`. */
  children: ReactNode
}

/** The change since the last period: an arrow, and a color for good or bad news. */
const StatDelta = forwardRef<TamaguiElement, StatDeltaProps>(function StatDelta(
  { trend = 'neutral', tone, trendLabel, variant = 'plain', children, ...props },
  ref,
) {
  const colors = tones[tone ?? defaultTones[trend]]
  const label = trendLabel ?? defaultTrendLabels[trend]
  return (
    <StatDeltaFrame
      ref={ref}
      variant={variant}
      {...(variant === 'badge' && { backgroundColor: colors.badge })}
      {...props}
    >
      {/* A mirrored trending-up arrow is the trending-down one. */}
      <View aria-hidden {...(trend === 'down' && { scaleY: -1 })}>
        <IconDefaults size={14} color={colors.icon}>
          {trend === 'neutral' ? <MinusIcon /> : <TrendingUpIcon />}
        </IconDefaults>
      </View>
      {isWeb ? <VisuallyHidden>{`${label} `}</VisuallyHidden> : null}
      <Text
        size="sm"
        weight="medium"
        tone={colors.text}
        // Native has no visually hidden text: the label joins the value's name.
        {...(!isWeb &&
          isTextContent(children) && { 'aria-label': `${label} ${[children].flat().join('')}` })}
      >
        {children}
      </Text>
    </StatDeltaFrame>
  )
})

export type StatProps = GetProps<typeof StatFrame>

const StatImpl = forwardRef<TamaguiElement, StatProps>(function Stat(
  { size = 'md', ...props },
  ref,
) {
  return <StatFrame ref={ref} size={size} {...props} />
})

/**
 * One figure with its label and how it changed. Compose with `Stat.Label`,
 * `Stat.Value`, `Stat.Delta` and `Stat.HelpText`.
 */
export const Stat = withStaticProperties(StatImpl, {
  Label: StatLabel,
  Value: StatValue,
  Delta: StatDelta,
  HelpText: StatHelpText,
})

export { StatFrame, StatLabel, StatValue, StatHelpText }
export type StatLabelProps = GetProps<typeof StatLabel>
export type StatValueProps = GetProps<typeof StatValue>
export type StatHelpTextProps = GetProps<typeof StatHelpText>
