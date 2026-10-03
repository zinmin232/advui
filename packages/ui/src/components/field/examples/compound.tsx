import { Button, Field, HStack, Input } from '@advui/core'

export default function FieldCompound() {
  return (
    // The control can sit anywhere inside: the field finds the Input through context.
    <Field
      label="Invite code"
      description="Paste the code from your email, or send a new one."
      width="100%"
      maxWidth={400}
    >
      <HStack gap="$2">
        <Input flex={1} placeholder="ABC-123" autoCapitalize="characters" />
        <Button variant="outline">Send code</Button>
      </HStack>
    </Field>
  )
}
