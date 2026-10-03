import { Form, Field, Input } from '@advui/core'

export default function FormTitleDescription() {
  return (
    <Form
      title="Create account"
      description="Enter your details. You can change them later."
      width="100%"
      maxWidth={400}
    >
      <Field label="Organization">
        <Input placeholder="Organization name" />
      </Field>
      <Field label="Email">
        <Input placeholder="you@example.org" inputMode="email" autoComplete="email" />
      </Field>
      <Form.Submit>Create account</Form.Submit>
    </Form>
  )
}
