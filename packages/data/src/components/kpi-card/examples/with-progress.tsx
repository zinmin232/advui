import { Progress, Text } from '@advui/core'
import { KpiCard } from '@advui/data'

export default function KpiCardWithProgress() {
  return (
    <KpiCard
      width="100%"
      maxWidth="$80"
      variant="elevated"
      label="Quarterly target"
      value="$182,400"
      description="of $250,000"
    >
      <Progress value={73} label="Quarterly target reached" />
      <Text size="xs" tone="muted">
        73% reached, 24 days left
      </Text>
    </KpiCard>
  )
}
