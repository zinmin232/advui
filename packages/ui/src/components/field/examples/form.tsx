import { Field, Form, Input, PasswordInput } from '@advui/core'

export default function FieldForm() {
  return (
    <Form width="100%" maxWidth={400} footer={<Form.Submit>Create account</Form.Submit>}>
      <Field label="Name" required>
        <Input autoComplete="name" />
      </Field>
      <Field label="Email" description="We never share your email." required>
        <Input inputMode="email" autoComplete="email" />
      </Field>
      <Field label="Password" error="Password is too short.">
        <PasswordInput defaultValue="secret" autoComplete="new-password" />
      </Field>
    </Form>
  )
}
