import { Badge, Card, HStack, Text, toast } from '@advui/core'

export default function CardInteractive() {
  return (
    <Card
      interactive
      role="link"
      aria-label="Open project Atlas"
      width="100%"
      maxWidth="$80"
      onPress={() => toast('Opening Atlas…')}
    >
      <Card.Header>
        <HStack justifyContent="space-between">
          <Card.Title>Atlas</Card.Title>
          <Badge variant="success" size="sm">
            Live
          </Badge>
        </HStack>
        <Card.Description>Updated 2 hours ago</Card.Description>
      </Card.Header>
      <Card.Content>
        <Text size="sm">Customer analytics dashboard.</Text>
      </Card.Content>
    </Card>
  )
}
