import { ColorPicker, Field } from '@advui/core'
import { useState } from 'react'

// With `alpha`, a translucent color comes back as #rrggbbaa.
export default function ColorPickerAlpha() {
  const [color, setColor] = useState('#8b5cf680')
  return (
    <Field label="Overlay tint" width="100%" maxWidth={280}>
      <ColorPicker alpha inline value={color} onValueChange={setColor} />
    </Field>
  )
}
