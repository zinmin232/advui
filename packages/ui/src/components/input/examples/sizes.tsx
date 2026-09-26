import { Input, VStack } from '@advui/core'

export default function InputSizes() {
  return (
    <VStack gap="$3" width="100%" maxWidth="$80">
      <Input size="sm" aria-label="Small" placeholder="Small" />
      <Input size="md" aria-label="Medium" placeholder="Medium" />
      <Input size="lg" aria-label="Large" placeholder="Large" />
    </VStack>
  )
}
