import { Button, Card, Input, Label, Tabs, VStack } from '@adv-ui/core'

export default function TabsBasic() {
  return (
    <Tabs defaultValue="account" width="100%" maxWidth="$96">
      <Tabs.List aria-label="Account settings">
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account">
        <Card>
          <Card.Header>
            <Card.Title>Account</Card.Title>
            <Card.Description>Make changes to your account.</Card.Description>
          </Card.Header>
          <Card.Content>
            <VStack gap="$2">
              <Label htmlFor="tabs-name">Name</Label>
              <Input id="tabs-name" defaultValue="Ada Lovelace" />
            </VStack>
          </Card.Content>
          <Card.Footer>
            <Button>Save</Button>
          </Card.Footer>
        </Card>
      </Tabs.Content>
      <Tabs.Content value="password">
        <Card>
          <Card.Header>
            <Card.Title>Password</Card.Title>
            <Card.Description>Use at least 12 characters.</Card.Description>
          </Card.Header>
          <Card.Content>
            <VStack gap="$2">
              <Label htmlFor="tabs-new">New password</Label>
              <Input id="tabs-new" secureTextEntry />
            </VStack>
          </Card.Content>
          <Card.Footer>
            <Button>Update password</Button>
          </Card.Footer>
        </Card>
      </Tabs.Content>
    </Tabs>
  )
}
