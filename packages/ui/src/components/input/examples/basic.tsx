import { Input, Label, Text, VStack } from '@advui/core'

export default function InputBasic() {
  return (
    <VStack gap="$2" width="100%" maxWidth="$80">
      <Label htmlFor="example-email">Email</Label>
      <Input
        id="example-email"
        placeholder="you@example.com"
        inputMode="email"
        autoComplete="email"
      />
      <Text size="sm" tone="muted">
        We’ll never share your email.
      </Text>
    </VStack>
  )
}
