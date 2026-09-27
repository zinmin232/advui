import { Chip, HStack, Text, VStack } from '@advui/core'
import { useState } from 'react'

const diets = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Halal']

export default function ChipFilter() {
  const [selected, setSelected] = useState<string[]>(['Vegetarian'])
  const toggle = (diet: string, on: boolean) =>
    setSelected((prev) => (on ? [...prev, diet] : prev.filter((d) => d !== diet)))

  return (
    <VStack gap="$3">
      <HStack gap="$2" flexWrap="wrap" role="group" aria-label="Dietary filters">
        {diets.map((diet) => (
          <Chip
            key={diet}
            selected={selected.includes(diet)}
            onSelectedChange={(on) => toggle(diet, on)}
          >
            {diet}
          </Chip>
        ))}
      </HStack>
      <Text size="sm" tone="muted">
        {selected.length ? `Showing: ${selected.join(', ')}` : 'Showing all recipes'}
      </Text>
    </VStack>
  )
}
