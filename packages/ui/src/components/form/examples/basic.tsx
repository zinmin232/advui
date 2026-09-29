import { Form, FormField, Input } from '@advui/core'

export default function FormBasic() {
  return (
    <Form width="100%" maxWidth={400}>
      <FormField label="Name">
        <Input placeholder="Ma Hla" autoComplete="name" />
      </FormField>
      <FormField label="Email">
        <Input placeholder="you@example.org" inputMode="email" autoComplete="email" />
      </FormField>
      <Form.Submit>Submit</Form.Submit>
    </Form>
  )
}
