import { Card, Grid, Text } from '@advui/core'

const stats = [
  { label: 'Revenue', value: '$45,231' },
  { label: 'Subscriptions', value: '+2,350' },
  { label: 'Sales', value: '+12,234' },
  { label: 'Active now', value: '573' },
]

export default function GridExample() {
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="$4" width="100%">
      {stats.map((s) => (
        <Card key={s.label}>
          <Card.Content gap="$1">
            <Text size="sm" tone="muted">
              {s.label}
            </Text>
            <Text size="2xl" weight="bold">
              {s.value}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </Grid>
  )
}
