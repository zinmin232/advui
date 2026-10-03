import { Form, Field, Input } from '@advui/core'

export default function FormBasic() {
  return (
    <Form width="100%" maxWidth={400}>
      <Field label="Name">
        <Input placeholder="Ma Hla" autoComplete="name" />
      </Field>
      <Field label="Email">
        <Input placeholder="you@example.org" inputMode="email" autoComplete="email" />
      </Field>
      <Form.Submit>Submit</Form.Submit>
    </Form>
  )
}
