import { CopyIcon, MailIcon } from '@advui/icons'
import { Field, IconButton, Input, VStack, toast } from '@advui/core'

export default function InputSlots() {
  return (
    <VStack gap="4" width="100%" maxWidth="80">
      <Field label="Email">
        <Input leading={<MailIcon />} placeholder="you@example.com" inputMode="email" />
      </Field>
      <Field label="Price">
        <Input leading="$" trailing="per month" placeholder="0.00" inputMode="decimal" />
      </Field>
      <Field label="API key">
        <Input
          defaultValue="demo_7Hq2xT9k"
          readOnly
          trailing={
            <IconButton
              size="sm"
              icon={<CopyIcon />}
              aria-label="Copy API key"
              onPress={() => toast('API key copied')}
            />
          }
        />
      </Field>
    </VStack>
  )
}
