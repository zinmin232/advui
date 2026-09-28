import { FormField, OtpInput } from '@advui/core'

export default function OtpInputGrouped() {
  return (
    <FormField label="Recovery code" error="That code has expired.">
      <OtpInput type="alphanumeric" groupSize={3} size="sm" defaultValue="A7K2" />
    </FormField>
  )
}
