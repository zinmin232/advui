import { HStack, Rating, Text } from '@advui/core'

// A product's average: 4.3 fills 30% of the fifth star.
export default function RatingReadOnly() {
  return (
    <HStack gap="$2" alignItems="center">
      <Rating aria-label="Average rating" readOnly value={4.3} size="sm" />
      <Text size="sm" weight="medium">
        4.3
      </Text>
      <Text size="sm" tone="muted">
        (1,248 reviews)
      </Text>
    </HStack>
  )
}
