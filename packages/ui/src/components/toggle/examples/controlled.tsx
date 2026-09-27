import { Text, Toggle, VStack } from '@advui/core'
import { HeartIcon } from '@advui/icons'
import { useState } from 'react'

export default function ToggleControlled() {
  const [saved, setSaved] = useState(false)
  return (
    <VStack gap="$2" alignItems="center">
      <Toggle
        variant="outline"
        size="lg"
        icon={<HeartIcon />}
        pressed={saved}
        onPressedChange={setSaved}
      >
        Save to favorites
      </Toggle>
      <Text size="sm" tone="muted" aria-live="polite">
        {saved ? 'Saved to your favorites.' : 'Not saved yet.'}
      </Text>
    </VStack>
  )
}
