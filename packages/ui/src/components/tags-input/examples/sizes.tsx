import { TagsInput, VStack } from '@advui/core'

export default function TagsInputSizes() {
  return (
    <VStack gap="3" width="100%" maxWidth="96">
      <TagsInput size="sm" aria-label="Small" defaultValue={['small']} placeholder="Add a tag" />
      <TagsInput size="md" aria-label="Medium" defaultValue={['medium']} placeholder="Add a tag" />
      <TagsInput size="lg" aria-label="Large" defaultValue={['large']} placeholder="Add a tag" />
    </VStack>
  )
}
