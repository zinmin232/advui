import { HStack, Label, Slider, Text, VStack } from '@advui/core'
import { useState } from 'react'

const price = (value: number) => `$${value}`

export default function SliderRange() {
  const [range, setRange] = useState([40, 160])
  return (
    <VStack gap="$3" width="100%" maxWidth="$80">
      <HStack justifyContent="space-between">
        <Label>Price</Label>
        <Text size="sm" tone="muted">
          {price(range[0] ?? 0)} – {price(range[1] ?? 0)}
        </Text>
      </HStack>
      <Slider
        aria-label="Price"
        min={0}
        max={200}
        step={5}
        size="lg"
        value={range}
        onValueChange={(value) => setRange(value as number[])}
        getValueText={price}
      />
    </VStack>
  )
}
