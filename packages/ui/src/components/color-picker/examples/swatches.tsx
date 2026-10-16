import { ColorPicker, Field } from '@advui/core'
import { useState } from 'react'

// Named swatches read their names to screen readers; plain strings read the color.
const labelColors = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
]

export default function ColorPickerSwatches() {
  const [color, setColor] = useState('#22c55e')
  return (
    <Field label="Label color" width="100%" maxWidth={280}>
      <ColorPicker inline swatches={labelColors} value={color} onValueChange={setColor} />
    </Field>
  )
}
