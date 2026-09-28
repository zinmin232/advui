import { FormField, NumberInput } from '@advui/core'

export default function NumberInputBasic() {
  return (
    <FormField label="Guests" description="Up to 10 per booking." width="100%" maxWidth={240}>
      <NumberInput defaultValue={2} min={1} max={10} />
    </FormField>
  )
}
