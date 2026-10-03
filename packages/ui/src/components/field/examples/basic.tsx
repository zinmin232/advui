import { Field, Input } from '@advui/core'

export default function FieldBasic() {
  return (
    <Field label="Name" width="100%" maxWidth={360}>
      <Input placeholder="Ma Hla" autoComplete="name" />
    </Field>
  )
}
