import { Badge, Chip, Text, VStack, Wrap } from '@advui/core'
import { useState } from 'react'

const topics = ['Health', 'Education', 'Shelter', 'Water and sanitation', 'Nutrition', 'Protection']

export default function WrapTags() {
  const [picked, setPicked] = useState<string[]>(['Health', 'Shelter'])
  const toggle = (topic: string, on: boolean) =>
    setPicked((prev) => (on ? [...prev, topic] : prev.filter((t) => t !== topic)))

  return (
    <VStack gap="$4" maxWidth="$96" width="100%">
      <Wrap role="group" aria-label="Topics">
        {topics.map((topic) => (
          <Chip
            key={topic}
            selected={picked.includes(topic)}
            onSelectedChange={(on) => toggle(topic, on)}
          >
            {topic}
          </Chip>
        ))}
      </Wrap>
      <VStack gap="$2">
        <Text size="sm" tone="muted">
          Shown on the report
        </Text>
        <Wrap gap="$1.5">
          {picked.length ? (
            picked.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))
          ) : (
            <Text size="sm">No topics yet</Text>
          )}
        </Wrap>
      </VStack>
    </VStack>
  )
}
