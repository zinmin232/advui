import { Button, Form, Field, Input, Textarea } from '@advui/core'

export default function FormFooter() {
  return (
    <Form
      title="Edit project"
      width="100%"
      maxWidth={400}
      footer={
        <>
          <Button variant="outline">Cancel</Button>
          <Form.Submit>Save</Form.Submit>
        </>
      }
    >
      <Field label="Project title">
        <Input defaultValue="Community water points" />
      </Field>
      <Field label="Summary" description="One or two sentences.">
        <Textarea placeholder="What the project does and for whom" />
      </Field>
    </Form>
  )
}
