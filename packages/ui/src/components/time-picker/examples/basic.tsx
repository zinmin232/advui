import { Field, TimePicker } from '@advui/core'
import { useState } from 'react'

export default function TimePickerBasic() {
  const [time, setTime] = useState<string | null>('09:30')
  return (
    <Field label="Start time">
      <TimePicker value={time} onValueChange={setTime} />
    </Field>
  )
}
