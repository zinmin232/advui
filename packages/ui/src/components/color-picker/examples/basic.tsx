import { ColorPicker, Field } from '@advui/core'
import { useState } from 'react'

export default function ColorPickerBasic() {
  const [color, setColor] = useState('#3b82f6')
  return (
    <Field label="Brand color" description="Used for buttons and links." width="100%" maxWidth={280}>
      <ColorPicker value={color} onValueChange={setColor} />
    </Field>
  )
}
