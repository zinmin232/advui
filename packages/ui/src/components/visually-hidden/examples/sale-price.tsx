import { HStack, Text, VStack, VisuallyHidden } from '@advui/core'

export default function VisuallyHiddenSalePrice() {
  return (
    <VStack gap="1">
      <Text weight="medium">Trail running shoes</Text>
      {/* Screen readers do not announce a strikethrough: say which price is which. */}
      <HStack gap="2" alignItems="baseline">
        <Text size="sm" tone="muted" textDecorationLine="line-through">
          <VisuallyHidden>Was </VisuallyHidden>$120
        </Text>
        <Text size="lg" weight="semibold">
          <VisuallyHidden>Now </VisuallyHidden>$84
        </Text>
      </HStack>
    </VStack>
  )
}
