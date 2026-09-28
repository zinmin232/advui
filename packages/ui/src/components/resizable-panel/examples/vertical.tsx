import { Resizable, Text, VStack } from '@advui/core'

export default function ResizableVertical() {
  return (
    <Resizable
      direction="vertical"
      height="$80"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
    >
      <Resizable.Panel defaultSize={60} minSize={25}>
        <VStack padding="$4" gap="$1">
          <Text weight="semibold">Query</Text>
          <Text size="sm" tone="muted" mono>
            SELECT township, COUNT(*) FROM activities GROUP BY township
          </Text>
        </VStack>
      </Resizable.Panel>
      <Resizable.Handle withHandle aria-label="Resize results" />
      <Resizable.Panel minSize={25}>
        <VStack padding="$4" gap="$1">
          <Text weight="semibold">Results</Text>
          <Text size="sm" tone="muted">
            330 townships · 0.4 s
          </Text>
        </VStack>
      </Resizable.Panel>
    </Resizable>
  )
}
