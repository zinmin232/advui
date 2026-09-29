import { Form, FormField, Input } from '@advui/core'

export default function FormTitleDescription() {
  return (
    <Form
      title="Create account"
      description="Enter your details. You can change them later."
      width="100%"
      maxWidth={400}
    >
      <FormField label="Organization">
        <Input placeholder="Organization name" />
      </FormField>
      <FormField label="Email">
        <Input placeholder="you@example.org" inputMode="email" autoComplete="email" />
      </FormField>
      <Form.Submit>Create account</Form.Submit>
    </Form>
  )
}
