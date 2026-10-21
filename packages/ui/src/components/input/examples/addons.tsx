import { Field, Input, VStack } from '@advui/core'

export default function InputAddons() {
  return (
    <VStack gap="4" width="100%" maxWidth="96">
      <Field label="Website">
        <Input leadingAddon="https://" trailingAddon=".com" placeholder="example" />
      </Field>
      <Field label="Weight" description="Without the packaging.">
        <Input trailingAddon="kg" placeholder="0" inputMode="decimal" size="sm" />
      </Field>
      <Field label="Amount" error="Enter an amount above 0.">
        <Input leadingAddon="USD" defaultValue="0" inputMode="decimal" size="lg" />
      </Field>
    </VStack>
  )
}
