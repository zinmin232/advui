import { Field, Input, Text } from '@advui/core'
import { LockIcon } from '@advui/icons'

// Nested Text does not inherit size or color: give elements their own.
export default function FieldRichContent() {
  return (
    <Field
      label={
        <>
          API key <LockIcon size={14} color="$mutedForeground" />
        </>
      }
      description={
        <>
          Starts with{' '}
          <Text size="sm" tone="muted" mono>
            sk_
          </Text>
          . Keep it secret.
        </>
      }
      error={
        <>
          This key was revoked.{' '}
          <Text size="sm" tone="error" weight="semibold">
            Create a new one in Settings.
          </Text>
        </>
      }
      width="100%"
      maxWidth={400}
    >
      <Input defaultValue="sk_live_0000" autoCapitalize="none" autoCorrect={false} />
    </Field>
  )
}
