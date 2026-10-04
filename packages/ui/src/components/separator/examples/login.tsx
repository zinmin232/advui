import { Button, Field, Input, Separator, Text, VStack } from '@advui/core'

export default function SeparatorLogin() {
  return (
    <VStack gap="$4" width="100%" maxWidth="$80">
      <Button variant="outline" fullWidth>
        Continue with Google
      </Button>
      <Separator label="or" />
      <Field label="Email">
        <Input inputMode="email" autoComplete="email" placeholder="you@example.org" />
      </Field>
      <Button fullWidth>Send a sign-in link</Button>
      <Separator label="New here?" labelPosition="start" />
      <Text size="sm" tone="muted">
        Ask your team admin for an invitation.
      </Text>
    </VStack>
  )
}
