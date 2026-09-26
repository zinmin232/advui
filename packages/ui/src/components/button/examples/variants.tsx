import { Button, HStack } from '@advui/core'

export default function ButtonVariants() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </HStack>
  )
}
