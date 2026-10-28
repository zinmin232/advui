import { DateTimePicker, Field } from '@advui/core'
import { useState } from 'react'

export default function DateTimePickerBasic() {
  const [start, setStart] = useState<Date | null>(new Date(2026, 9, 14, 9, 30))
  return (
    <Field label="Starts" description="In your time zone." width="100%" maxWidth={400}>
      <DateTimePicker value={start} onValueChange={setStart} />
    </Field>
  )
}
