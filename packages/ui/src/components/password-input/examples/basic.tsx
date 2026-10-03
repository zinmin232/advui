import { Field, PasswordInput } from '@advui/core'

export default function PasswordInputBasic() {
  return (
    <Field label="Password" description="At least 12 characters." width="100%" maxWidth={360}>
      <PasswordInput defaultValue="correct horse" autoComplete="new-password" />
    </Field>
  )
}
