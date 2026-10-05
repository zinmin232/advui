import { Form, Field, Input } from '@advui/core'

export default function FormDisabled() {
  return (
    <Form
      title="Reporting period"
      description="The 5W round is closed. Editing opens again next round."
      disabled
      width="100%"
      maxWidth={400}
      footer={<Form.Submit>Save</Form.Submit>}
    >
      {/* The inputs and Form.Submit follow the form's `disabled`. */}
      <Field label="Start">
        <Input defaultValue="January 2026" />
      </Field>
      <Field label="End">
        <Input defaultValue="June 2026" />
      </Field>
    </Form>
  )
}
