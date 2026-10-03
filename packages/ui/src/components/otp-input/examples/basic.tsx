import { Field, OtpInput, Text, VStack } from '@advui/core'
import { useState } from 'react'

export default function OtpInputBasic() {
  const [status, setStatus] = useState('Enter the 6-digit code we sent you.')
  return (
    <VStack gap="$2">
      <Field label="Verification code">
        <OtpInput onComplete={(code) => setStatus(`Checking ${code}…`)} />
      </Field>
      <Text size="sm" tone="muted">
        {status}
      </Text>
    </VStack>
  )
}
