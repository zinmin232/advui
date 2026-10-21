import { ColorPicker, HStack, Text, VStack } from '@advui/core'
import { useState } from 'react'

// onValueChange follows every drag; onValueCommit fires once it ends, e.g. to save.
export default function ColorPickerInline() {
  const [color, setColor] = useState('#10b981')
  const [saved, setSaved] = useState('#10b981')
  return (
    <HStack gap="5" flexWrap="wrap" alignItems="flex-start">
      <ColorPicker
        inline
        aria-label="Highlight color"
        value={color}
        onValueChange={setColor}
        onValueCommit={setSaved}
      />
      <VStack gap="1">
        <Text size="sm" tone="muted">
          Current: {color}
        </Text>
        <Text size="sm" tone="muted">
          Saved: {saved}
        </Text>
      </VStack>
    </HStack>
  )
}
