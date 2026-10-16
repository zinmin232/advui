import { Rating, VStack } from '@advui/core'
import { HeartIcon } from '@advui/icons'

export default function RatingCustomIcon() {
  return (
    <VStack gap="$3">
      <Rating
        aria-label="How much did you like it?"
        icon={HeartIcon}
        color="$primary"
        defaultValue={4}
      />
      <Rating aria-label="Difficulty" count={10} size="sm" defaultValue={6} />
    </VStack>
  )
}
