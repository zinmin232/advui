import { Field, Input } from '@advui/core'

export default function FieldDescription() {
  return (
    <Field
      label="Username"
      description="3–20 letters or numbers. Others see it on your profile."
      width="100%"
      maxWidth={360}
    >
      <Input placeholder="ada" autoCapitalize="none" />
    </Field>
  )
}
