import { HStack, Rating, Text } from '@advui/core'
import { useState } from 'react'

const words = ['Not rated', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

export default function RatingBasic() {
  const [value, setValue] = useState(3)
  return (
    <HStack gap="3" alignItems="center">
      <Rating aria-label="Rate this recipe" value={value} onValueChange={setValue} />
      <Text size="sm" tone="muted">
        {words[value]}
      </Text>
    </HStack>
  )
}
