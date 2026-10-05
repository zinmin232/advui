import { IconDefaults } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import { type TamaguiElement, View, XStack, isWeb } from 'tamagui'
import { Card, type CardProps, Skeleton } from '@advui/core'
import { Stat, type StatTone, type StatTrend } from '../stat/Stat'

export interface KpiCardProps extends Omit<CardProps, 'children'> {
  /** What is measured, e.g. "Total revenue". */
  label: ReactNode
  /** The figure, already formatted. */
  value: ReactNode
  /** The change since the last period, e.g. `"12.5%"`. */
  delta?: ReactNode
  /** Direction of the change; picks the arrow. */
  trend?: StatTrend
  /** Good or bad news; picks the color. Defaults from `trend`. */
  tone?: StatTone
  /** Read by screen readers before the delta. Default: "Increased by" and so on. */
  trendLabel?: string
  /** Short note after the delta, e.g. "from last month". */
  description?: ReactNode
  /** Icon in the top corner. Decorative. */
  icon?: ReactNode
  /** Shows placeholders for the value and delta, and marks the card busy. */
  loading?: boolean
  /** Extra content below the figure: a Progress bar, a sparkline, a link. */
  children?: ReactNode
}

/**
 * A card for one key figure on a dashboard: label, value, the change since
 * the last period and an optional icon. Built from `Card` and `Stat`.
 */
export const KpiCard = forwardRef<TamaguiElement, KpiCardProps>(function KpiCard(
  {
    label,
    value,
    delta,
    trend = 'neutral',
    tone,
    trendLabel,
    description,
    icon,
    loading = false,
    children,
    ...props
  },
  ref,
) {
  const footer = delta != null || description != null
  return (
    <Card
      ref={ref}
      // Web only: Android has no busy state for an unnamed view and would read
      // "busy" on it for good.
      {...(isWeb && { 'aria-busy': loading || undefined })}
      {...props}
    >
      <Card.Content gap="$3">
        <Stat>
          <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
            <Stat.Label flex={1}>{label}</Stat.Label>
            {icon ? (
              <View aria-hidden>
                <IconDefaults size={16} color="$mutedForeground">
                  {icon}
                </IconDefaults>
              </View>
            ) : null}
          </XStack>
          {loading ? (
            <>
              <Skeleton height="$9" width="$32" marginVertical="$0.5" />
              {footer ? <Skeleton height="$4" width="$40" /> : null}
            </>
          ) : (
            <>
              <Stat.Value>{value}</Stat.Value>
              {footer ? (
                <XStack alignItems="center" gap="$1.5" flexWrap="wrap">
                  {delta != null ? (
                    <Stat.Delta trend={trend} tone={tone} trendLabel={trendLabel}>
                      {delta}
                    </Stat.Delta>
                  ) : null}
                  {description != null ? <Stat.HelpText>{description}</Stat.HelpText> : null}
                </XStack>
              ) : null}
            </>
          )}
        </Stat>
        {children}
      </Card.Content>
    </Card>
  )
})
