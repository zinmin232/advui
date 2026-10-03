import { Field, MultiSelect } from '@advui/core'
import { useState } from 'react'

const labels = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'docs', label: 'Docs' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'perf', label: 'Performance' },
  { value: 'native', label: 'Native' },
]

export default function MultiSelectBasic() {
  const [picked, setPicked] = useState(['bug', 'a11y'])
  return (
    <Field label="Labels" width="100%" maxWidth={360}>
      <MultiSelect
        options={labels}
        value={picked}
        onValueChange={setPicked}
        placeholder="Add labels…"
        title="Labels"
      />
    </Field>
  )
}
