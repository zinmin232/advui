import { Field, TagsInput } from '@advui/core'
import { useState } from 'react'

const isEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)

// The app validates: a refused address stays in the text box and Field shows why.
export default function TagsInputValidation() {
  const [emails, setEmails] = useState(['ada@example.com'])
  const [error, setError] = useState<string>()
  return (
    <Field
      label="Invite people"
      description="Up to 5 email addresses."
      error={error}
      width="100%"
      maxWidth="96"
    >
      <TagsInput
        value={emails}
        onValueChange={(next) => {
          setEmails(next)
          setError(undefined)
        }}
        max={5}
        validate={(tag) => {
          setError(isEmail(tag) ? undefined : `“${tag}” is not an email address.`)
          return isEmail(tag)
        }}
        separators={[',', ' ']}
        placeholder="name@example.com"
      />
    </Field>
  )
}
