import { Button, HStack } from '@advui/core'

export default function ButtonDisabled() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      <Button disabled>Default</Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
    </HStack>
  )
}
