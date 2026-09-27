import { Text, ToggleGroup, VStack } from '@advui/core'
import { BoldIcon, ItalicIcon, LayoutGridIcon, ListIcon, UnderlineIcon } from '@advui/icons'
import { useState } from 'react'

export default function ToggleGroupMultiple() {
  const [styles, setStyles] = useState<string[]>(['bold'])
  const [view, setView] = useState('grid')
  return (
    <VStack gap="$4" alignItems="center">
      <ToggleGroup
        type="multiple"
        variant="outline"
        value={styles}
        onValueChange={setStyles}
        aria-label="Text style"
      >
        <ToggleGroup.Item value="bold" aria-label="Bold" icon={<BoldIcon />} />
        <ToggleGroup.Item value="italic" aria-label="Italic" icon={<ItalicIcon />} />
        <ToggleGroup.Item value="underline" aria-label="Underline" icon={<UnderlineIcon />} />
      </ToggleGroup>
      <Text size="sm" tone="muted">
        Style: {styles.length ? styles.join(', ') : 'none'}
      </Text>

      <ToggleGroup type="single" size="sm" value={view} onValueChange={setView} aria-label="View">
        <ToggleGroup.Item value="grid" icon={<LayoutGridIcon />}>
          Grid
        </ToggleGroup.Item>
        <ToggleGroup.Item value="list" icon={<ListIcon />}>
          List
        </ToggleGroup.Item>
      </ToggleGroup>
    </VStack>
  )
}
