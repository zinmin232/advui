import { Spoiler, Text, VStack } from '@advui/core'

const changes = [
  'Faster search in large folders',
  'Dark theme for the settings page',
  'Export to CSV from any table',
  'Keyboard shortcuts for moving cards',
  'Shared links that expire',
  'Two-step sign-in with a security key',
  'Fewer emails about mentions',
  'A new icon for archived projects',
]

export default function SpoilerLabels() {
  return (
    <VStack gap="2" width="100%" maxWidth="96">
      <Text size="sm" weight="semibold">
        What's new in 4.2
      </Text>
      <Spoiler
        maxHeight="24"
        showLabel={`Show all ${changes.length} changes`}
        hideLabel="Show fewer"
      >
        <VStack gap="1">
          {changes.map((change) => (
            <Text key={change} size="sm">
              {change}
            </Text>
          ))}
        </VStack>
      </Spoiler>
    </VStack>
  )
}
