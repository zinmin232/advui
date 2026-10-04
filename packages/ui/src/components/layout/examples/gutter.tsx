import { Container, Text, VStack } from '@advui/core'

function Band({ label }: { label: string }) {
  return (
    <VStack padding="$3" backgroundColor="$muted" borderRadius="$md">
      <Text size="sm">{label}</Text>
    </VStack>
  )
}

export default function ContainerGutter() {
  return (
    <VStack gap="$3" width="100%">
      <Container size="sm" borderWidth={1} borderColor="$border" borderRadius="$lg">
        <Band label="Default gutter: 16px, 24px from md, 32px from lg" />
      </Container>
      <Container size="sm" gutter="$0" borderWidth={1} borderColor="$border" borderRadius="$lg">
        <Band label='gutter="$0": edge to edge' />
      </Container>
      <Container size="sm" centerContent borderWidth={1} borderColor="$border" borderRadius="$lg">
        <Text paddingVertical="$3">centerContent</Text>
      </Container>
    </VStack>
  )
}
