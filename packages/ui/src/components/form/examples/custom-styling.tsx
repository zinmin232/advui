import { Button, Form, FormField, Input, PasswordInput } from '@advui/core'

export default function FormCustomStyling() {
  return (
    // Form takes every style prop and a theme, like any view.
    <Form
      title="Sign in"
      width="100%"
      maxWidth={400}
      padding="$6"
      borderRadius="$xl"
      borderWidth={1}
      borderColor="$border"
      backgroundColor="$card"
      gap="$5"
      footer={
        <>
          <Button variant="link">Forgot password?</Button>
          <Form.Submit>Sign in</Form.Submit>
        </>
      }
    >
      <FormField label="Email">
        <Input placeholder="you@example.org" inputMode="email" autoComplete="email" />
      </FormField>
      <FormField label="Password">
        <PasswordInput autoComplete="current-password" />
      </FormField>
    </Form>
  )
}
