import { Button, HStack } from '@adv-ui/core'

export default function ButtonSizes() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </HStack>
  )
}
