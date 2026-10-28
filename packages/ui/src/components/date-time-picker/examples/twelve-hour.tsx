import { DateTimePicker, Field, Text, VStack } from '@advui/core'
import { useState } from 'react'

const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

export default function DateTimePickerTwelveHour() {
  const [pickup, setPickup] = useState<Date | null>(null)
  return (
    <VStack gap="2" width="100%" maxWidth={400}>
      <Field label="Pickup" description="Weekdays only.">
        <DateTimePicker
          value={pickup}
          onValueChange={setPickup}
          hourCycle={12}
          minuteStep={15}
          isDateDisabled={weekend}
          formatOptions={{ weekday: 'short', month: 'short', day: 'numeric' }}
          size="sm"
        />
      </Field>
      <Text size="sm" tone="muted">
        Value: {pickup ? pickup.toLocaleString() : 'none'}
      </Text>
    </VStack>
  )
}
