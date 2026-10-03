import { Field, Input, VStack } from '@advui/core'

export default function FieldRequiredOptional() {
  return (
    <VStack gap="$4" width="100%" maxWidth={360}>
      {/* The asterisk is visual; the input itself is marked required for screen readers. */}
      <Field label="Email" required>
        <Input placeholder="you@example.org" inputMode="email" autoComplete="email" />
      </Field>
      <Field label="Nickname" optional>
        <Input placeholder="What friends call you" />
      </Field>
    </VStack>
  )
}
