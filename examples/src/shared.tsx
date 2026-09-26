import { Card, HStack, Text, VStack } from '@adv-ui/core'
import { TrendingUpIcon } from '@adv-ui/icons'
import type { ReactNode } from 'react'
import { View } from 'tamagui'

const brandMark = 'aUI'

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <View
      height={size}
      minWidth={size}
      paddingHorizontal={size * 0.18}
      borderRadius="$lg"
      backgroundColor="$primary"
      alignItems="center"
      justifyContent="center"
      aria-hidden
    >
      <Text
        color="$primaryForeground"
        weight="bold"
        fontSize={size * 0.5}
        lineHeight={size}
        letterSpacing={-0.3}
        userSelect="none"
      >
        {brandMark}
      </Text>
    </View>
  )
}

/** Small KPI card used by the dashboards (a preview of the planned KPI Card component). */
export function Kpi({
  label,
  value,
  delta,
  icon,
}: {
  label: string
  value: string
  delta?: string
  icon?: ReactNode
}) {
  return (
    <Card>
      <Card.Content gap="$2">
        <HStack justifyContent="space-between">
          <Text size="sm" tone="muted" weight="medium">
            {label}
          </Text>
          {icon}
        </HStack>
        <Text size="2xl" weight="bold">
          {value}
        </Text>
        {delta ? (
          <HStack gap="$1">
            <TrendingUpIcon size={14} color="$success" />
            <Text size="xs" tone="success">
              {delta}
            </Text>
          </HStack>
        ) : null}
      </Card.Content>
    </Card>
  )
}

export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <VStack gap="$1">
      <Text render="h2" size="lg" weight="semibold" margin={0} role="heading" aria-level={2}>
        {title}
      </Text>
      {description ? (
        <Text size="sm" tone="muted">
          {description}
        </Text>
      ) : null}
    </VStack>
  )
}

export const people = [
  {
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    role: 'Owner',
    img: 32,
  },
  {
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    role: 'Admin',
    img: 12,
  },
  {
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    role: 'Member',
    img: 47,
  },
  { name: 'William Kim', email: 'will@email.com', amount: '+$99.00', role: 'Member', img: 15 },
  {
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    role: 'Viewer',
    img: 44,
  },
]

export const avatarUrl = (img: number) => `https://i.pravatar.cc/128?img=${img}`

/** Decorative icon overlaid at the start of an Input (add paddingLeft="$9" to the Input). */
export function InputIcon({ children }: { children: ReactNode }) {
  return (
    <View
      position="absolute"
      left="$3"
      top={0}
      bottom={0}
      justifyContent="center"
      pointerEvents="none"
      aria-hidden
    >
      {children}
    </View>
  )
}
