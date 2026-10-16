import { Rating, VStack } from '@advui/core'

export default function RatingHalf() {
  return (
    <VStack gap="$3">
      <Rating aria-label="Small" allowHalf defaultValue={2.5} size="sm" />
      <Rating aria-label="Medium" allowHalf defaultValue={3.5} />
      <Rating aria-label="Large" allowHalf defaultValue={4.5} size="lg" />
    </VStack>
  )
}
