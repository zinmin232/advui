import { FormField, Input } from '@advui/core'

export default function FormFieldBasic() {
  return (
    <FormField label="Username" description="3–20 letters or numbers." width="100%" maxWidth={360}>
      <Input placeholder="ada" autoCapitalize="none" />
    </FormField>
  )
}
