import { Button, HStack } from '@advui/core'

export default function ButtonSizes() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </HStack>
  )
}
