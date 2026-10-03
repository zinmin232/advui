import { Field, Input, PasswordInput, VStack } from '@advui/core'
import { useState } from 'react'

// The app (or React Hook Form, Formik…) validates; Field only shows the result.
export default function FieldValidation() {
  const [email, setEmail] = useState('ada@')
  const [password, setPassword] = useState('secret')
  const emailError = /^\S+@\S+\.\S+$/.test(email)
    ? undefined
    : 'Enter an email like you@example.org.'
  const passwordError = password.length >= 8 ? undefined : 'Too short.'
  return (
    <VStack gap="$4" width="100%" maxWidth={360}>
      <Field label="Email" required error={emailError}>
        <Input value={email} onChangeText={setEmail} inputMode="email" />
      </Field>
      <Field label="Password" description="At least 8 characters." error={passwordError}>
        <PasswordInput value={password} onChangeText={setPassword} />
      </Field>
    </VStack>
  )
}
