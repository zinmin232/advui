import { Combobox, type ComboboxOption, FormField } from '@advui/core'
import { useState } from 'react'

const timezones: ComboboxOption[] = [
  { value: 'Asia/Yangon', label: 'Yangon', description: 'UTC+06:30' },
  { value: 'Asia/Bangkok', label: 'Bangkok', description: 'UTC+07:00' },
  { value: 'Asia/Singapore', label: 'Singapore', description: 'UTC+08:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo', description: 'UTC+09:00' },
  { value: 'Europe/London', label: 'London', description: 'UTC+00:00' },
  { value: 'Europe/Paris', label: 'Paris', description: 'UTC+01:00' },
  { value: 'America/New_York', label: 'New York', description: 'UTC−05:00' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', description: 'UTC−03:00', disabled: true },
]

export default function ComboboxBasic() {
  const [zone, setZone] = useState<string | null>('Asia/Yangon')
  return (
    <FormField label="Time zone" width="100%" maxWidth={320}>
      <Combobox
        options={timezones}
        value={zone}
        onValueChange={setZone}
        placeholder="Search cities…"
        title="Time zone"
      />
    </FormField>
  )
}
