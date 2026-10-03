import { Form, Field, Input } from '@advui/core'
import { useState } from 'react'

// Values and errors live in the app (or React Hook Form, Formik…); Form lays
// out the fields and calls onSubmit.
export default function FormValidation() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()

  const handleSubmit = () => {
    setError(/^\S+@\S+\.\S+$/.test(email) ? undefined : 'Enter an email like you@example.org.')
  }

  return (
    <Form
      title="Subscribe"
      description="Get the monthly update by email."
      width="100%"
      maxWidth={400}
      onSubmit={handleSubmit}
      footer={<Form.Submit>Subscribe</Form.Submit>}
    >
      <Field label="Email" required error={error}>
        <Input value={email} onChangeText={setEmail} inputMode="email" autoComplete="email" />
      </Field>
    </Form>
  )
}
