import { Input, Label, Text, VStack } from '@advui/core'

export default function InputStates() {
  return (
    <VStack gap="$4" width="100%" maxWidth="$80">
      <VStack gap="$2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue="ab" invalid aria-describedby="username-error" />
        <Text id="username-error" size="sm" tone="error">
          Username must be at least 3 characters.
        </Text>
      </VStack>
      <VStack gap="$2">
        <Label htmlFor="team" disabled>
          Team
        </Label>
        <Input id="team" defaultValue="Design" disabled />
      </VStack>
    </VStack>
  )
}
