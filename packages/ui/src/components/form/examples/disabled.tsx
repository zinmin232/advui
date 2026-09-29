import { Form, FormField, Input } from '@advui/core'

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
      {/* Form Field and Form.Submit follow the form's `disabled`. */}
      <FormField label="Start">
        <Input defaultValue="January 2026" />
      </FormField>
      <FormField label="End">
        <Input defaultValue="June 2026" />
      </FormField>
    </Form>
  )
}
