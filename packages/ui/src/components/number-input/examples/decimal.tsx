import { Field, NumberInput, Text, VStack } from '@advui/core'
import { useState } from 'react'

export default function NumberInputDecimal() {
  const [weight, setWeight] = useState<number | null>(1.5)
  return (
    <VStack gap="$2" width="100%" maxWidth={240}>
      <Field label="Weight (kg)">
        <NumberInput size="sm" value={weight} onValueChange={setWeight} min={0} step={0.1} />
      </Field>
      <Text size="sm" tone="muted">
        Value: {weight ?? 'empty'}
      </Text>
    </VStack>
  )
}
