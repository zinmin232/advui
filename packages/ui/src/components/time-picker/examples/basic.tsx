import { FormField, TimePicker } from '@advui/core'
import { useState } from 'react'

export default function TimePickerBasic() {
  const [time, setTime] = useState<string | null>('09:30')
  return (
    <FormField label="Start time">
      <TimePicker value={time} onValueChange={setTime} />
    </FormField>
  )
}
