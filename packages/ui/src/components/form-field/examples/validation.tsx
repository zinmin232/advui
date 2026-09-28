import { FormField, Input, Textarea, VStack } from '@advui/core'
import { useState } from 'react'

export default function FormFieldValidation() {
  const [email, setEmail] = useState('ada@')
  const error = /^\S+@\S+\.\S+$/.test(email) ? undefined : 'Enter an email like you@example.com.'
  return (
    <VStack gap="$4" width="100%" maxWidth={360}>
      <FormField label="Email" required error={error}>
        <Input value={email} onChangeText={setEmail} inputMode="email" />
      </FormField>
      <FormField label="Notes" description="Optional." disabled>
        <Textarea placeholder="Not editable yet" />
      </FormField>
    </VStack>
  )
}
