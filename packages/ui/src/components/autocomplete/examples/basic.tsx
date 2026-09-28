import { Autocomplete, FormField } from '@advui/core'
import { useState } from 'react'

const cities = ['Mandalay', 'Naypyidaw', 'Bago', 'Mawlamyine', 'Taunggyi', 'Pathein', 'Myitkyina']

export default function AutocompleteBasic() {
  const [city, setCity] = useState('')
  return (
    <FormField
      label="City"
      description="Pick a suggestion or type any city."
      width="100%"
      maxWidth={320}
    >
      <Autocomplete
        options={cities.map((name) => ({ value: name, label: name }))}
        value={city}
        onValueChange={setCity}
        placeholder="Start typing…"
        title="City"
      />
    </FormField>
  )
}
