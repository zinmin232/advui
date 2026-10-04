import { Button, HStack, ScrollArea, Sticky, Text, VStack } from '@advui/core'

const paragraphs = Array.from({ length: 8 }, (_, i) => i + 1)

export default function StickyPageHeader() {
  return (
    <ScrollArea
      aria-label="Report"
      height={280}
      width="100%"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
    >
      <VStack>
        <Sticky>
          <HStack
            distribute="between"
            padding="$3"
            backgroundColor="$background"
            borderBottomWidth={1}
            borderColor="$border"
          >
            <Text weight="semibold">Quarterly report</Text>
            <Button size="sm">Download</Button>
          </HStack>
        </Sticky>
        <VStack padding="$4" gap="$3">
          {paragraphs.map((n) => (
            <Text key={n} tone="muted">
              Section {n}. Scroll: the header stays at the top while the report moves under it.
            </Text>
          ))}
        </VStack>
      </VStack>
    </ScrollArea>
  )
}
