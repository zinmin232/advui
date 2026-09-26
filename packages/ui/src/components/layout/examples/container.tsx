import { Container, Text } from '@advui/core'

export default function ContainerExample() {
  return (
    <Container size="sm" backgroundColor="$muted" borderRadius="$lg" paddingVertical="$6">
      <Text>This content is centered and capped at the sm breakpoint (640px).</Text>
    </Container>
  )
}
