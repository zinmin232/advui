import { Field, Rating } from '@advui/core'
import { useState } from 'react'

// The app validates; Field names the rating and shows the error under it.
export default function RatingField() {
  const [value, setValue] = useState(0)
  return (
    <Field
      label="How was your stay?"
      description="Your rating is shown with your review."
      error={value === 0 ? 'Pick a rating.' : undefined}
      required
    >
      <Rating name="stay" value={value} onValueChange={setValue} />
    </Field>
  )
}
