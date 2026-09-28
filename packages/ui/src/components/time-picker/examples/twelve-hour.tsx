import { FormField, Text, TimePicker, VStack } from '@advui/core'
import { useState } from 'react'

export default function TimePickerTwelveHour() {
  const [time, setTime] = useState<string | null>('14:45')
  return (
    <VStack gap="$2">
      <FormField label="Pickup">
        <TimePicker value={time} onValueChange={setTime} hourCycle={12} minuteStep={15} size="sm" />
      </FormField>
      <Text size="sm" tone="muted">
        Value: {time ?? 'none'}
      </Text>
    </VStack>
  )
}
