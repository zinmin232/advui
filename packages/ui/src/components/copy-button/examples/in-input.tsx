import { CopyButton, Field, Input } from '@advui/core'

const apiKey = 'demo_7Hq2xT9k'

export default function CopyButtonInInput() {
  return (
    <Field label="API key" width="100%" maxWidth="80">
      <Input
        defaultValue={apiKey}
        readOnly
        trailing={<CopyButton size="sm" value={apiKey} labels={{ copy: 'Copy API key' }} />}
      />
    </Field>
  )
}
