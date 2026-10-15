import { CheckboxGroup, Field } from '@advui/core'
import { useState } from 'react'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// The app validates; Field shows the error and the group marks every box invalid.
export default function CheckboxGroupField() {
  const [value, setValue] = useState<string[]>([])
  return (
    <Field
      label="Delivery days"
      description="We deliver between 9 am and 5 pm."
      error={value.length === 0 ? 'Pick at least one day.' : undefined}
      required
      maxWidth={360}
    >
      <CheckboxGroup orientation="horizontal" name="days" value={value} onValueChange={setValue}>
        {days.map((day) => (
          <CheckboxGroup.Item key={day} value={day.toLowerCase()} label={day} />
        ))}
      </CheckboxGroup>
    </Field>
  )
}
