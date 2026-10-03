import { Field, Textarea } from '@advui/core'

export default function FieldDisabled() {
  return (
    <Field
      label="Notes"
      description="You can add notes once the order ships."
      disabled
      width="100%"
      maxWidth={360}
    >
      <Textarea placeholder="Not editable yet" />
    </Field>
  )
}
