import { Avatar, Badge, Button, HStack, Spacer, Text, VStack } from '@adv-ui/core'

export default function StackBasic() {
  return (
    <VStack gap="$3" width="100%" maxWidth="$96">
      {['Maya Chen', 'Jordan Lee'].map((name) => (
        <HStack
          key={name}
          gap="$3"
          padding="$3"
          borderWidth={1}
          borderColor="$border"
          borderRadius="$lg"
        >
          <Avatar alt={name} size="sm" />
          <VStack>
            <Text weight="medium">{name}</Text>
            <Text size="sm" tone="muted">
              Product designer
            </Text>
          </VStack>
          <Spacer />
          <Badge variant="secondary" size="sm">
            Admin
          </Badge>
          <Button size="sm" variant="ghost">
            Edit
          </Button>
        </HStack>
      ))}
    </VStack>
  )
}
