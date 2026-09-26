import { Card, Grid, Text } from '@advui/core'

const variants = ['outline', 'elevated', 'filled', 'ghost'] as const

export default function CardVariants() {
  return (
    <Grid columns={{ base: 1, sm: 2 }} gap="$4" width="100%">
      {variants.map((variant) => (
        <Card key={variant} variant={variant}>
          <Card.Header>
            <Card.Title>{variant}</Card.Title>
          </Card.Header>
          <Card.Content>
            <Text size="sm" tone="muted">
              A {variant} card surface.
            </Text>
          </Card.Content>
        </Card>
      ))}
    </Grid>
  )
}
