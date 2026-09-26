import { Accordion, Badge, HStack, Switch, Text, VStack } from '@advui/core'

export default function AccordionCard() {
  return (
    <Accordion type="multiple" variant="card" defaultValue={['notifications']} maxWidth="$128">
      <Accordion.Item value="notifications">
        <Accordion.Trigger>
          <HStack gap="$2" alignItems="center">
            <Text size="sm" weight="medium">
              Notifications
            </Text>
            <Badge variant="info" size="sm">
              2 on
            </Badge>
          </HStack>
        </Accordion.Trigger>
        <Accordion.Content>
          <VStack gap="$3">
            <HStack justifyContent="space-between" alignItems="center">
              <Text size="sm">Email digests</Text>
              <Switch aria-label="Email digests" defaultChecked />
            </HStack>
            <HStack justifyContent="space-between" alignItems="center">
              <Text size="sm">Push notifications</Text>
              <Switch aria-label="Push notifications" defaultChecked />
            </HStack>
          </VStack>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="privacy">
        <Accordion.Trigger>Privacy</Accordion.Trigger>
        <Accordion.Content>
          Your profile is visible to members of your workspace only.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="billing" disabled>
        <Accordion.Trigger>Billing (owners only)</Accordion.Trigger>
        <Accordion.Content>Plans and invoices.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  )
}
