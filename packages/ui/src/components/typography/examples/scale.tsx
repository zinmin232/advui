import { HStack, Heading, Kbd, Text, VStack } from '@adv-ui/core'

export default function TypographyScale() {
  return (
    <VStack gap="$2">
      <Heading level={1}>The quick brown fox</Heading>
      <Heading level={2}>The quick brown fox</Heading>
      <Heading level={3}>The quick brown fox</Heading>
      <Heading level={4}>The quick brown fox</Heading>
      <Text size="lg">Large body text for introductions.</Text>
      <Text>Base body text for most content.</Text>
      <Text size="sm">Small text for supporting content.</Text>
      <Text size="xs" tone="muted">
        Extra small for captions.
      </Text>
      <Text mono size="sm">
        pnpm add @adv-ui/core
      </Text>
      <HStack gap="$1">
        <Text size="sm">Search with</Text>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </HStack>
    </VStack>
  )
}
