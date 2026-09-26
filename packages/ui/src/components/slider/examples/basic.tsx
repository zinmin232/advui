import { HStack, Label, Slider, Text, VStack } from '@advui/core'
import { useState } from 'react'

export default function SliderBasic() {
  const [volume, setVolume] = useState(40)
  return (
    <VStack gap="$3" width="100%" maxWidth="$80">
      <HStack justifyContent="space-between">
        <Label id="volume-label">Volume</Label>
        <Text size="sm" tone="muted">
          {volume}%
        </Text>
      </HStack>
      <Slider
        aria-labelledby="volume-label"
        value={volume}
        onValueChange={(value) => setVolume(value as number)}
        getValueText={(value) => `${value}%`}
      />
      <Slider aria-label="Brightness (disabled)" defaultValue={70} disabled size="sm" />
    </VStack>
  )
}
