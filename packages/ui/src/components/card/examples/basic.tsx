import { Button, Card, Input, Label, VStack } from '@adv-ui/core'

export default function CardBasic() {
  return (
    <Card width="100%" maxWidth="$96">
      <Card.Header>
        <Card.Title>Create project</Card.Title>
        <Card.Description>Deploy your new project in one click.</Card.Description>
      </Card.Header>
      <Card.Content>
        <VStack gap="$2">
          <Label htmlFor="card-name">Name</Label>
          <Input id="card-name" placeholder="Name of your project" />
        </VStack>
      </Card.Content>
      <Card.Footer justifyContent="flex-end">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </Card.Footer>
    </Card>
  )
}
