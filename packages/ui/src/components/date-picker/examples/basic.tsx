import { DatePicker, FormField } from '@advui/core'
import { useState } from 'react'

export default function DatePickerBasic() {
  const [due, setDue] = useState<Date | null>(new Date(2026, 9, 14))
  return (
    <FormField
      label="Due date"
      description="We remind you a day before."
      width="100%"
      maxWidth={280}
    >
      <DatePicker value={due} onValueChange={setDue} />
    </FormField>
  )
}
