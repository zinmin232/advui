import { HStack, Separator, Text, VStack } from '@advui/core'

export default function SeparatorBasic() {
  return (
    <VStack gap="$3" maxWidth="$80" width="100%">
      <VStack gap="$1">
        <Text weight="medium">Adv UI</Text>
        <Text size="sm" tone="muted">
          Cross-platform components.
        </Text>
      </VStack>
      <Separator />
      <HStack gap="$3" height="$5">
        <Text size="sm">Docs</Text>
        <Separator orientation="vertical" />
        <Text size="sm">Components</Text>
        <Separator orientation="vertical" />
        <Text size="sm">Themes</Text>
      </HStack>
    </VStack>
  )
}
