import { Checkbox, HStack, Label, VStack } from '@adv-ui/core'
import { useState } from 'react'

export default function CheckboxBasic() {
  const [checked, setChecked] = useState(true)
  return (
    <VStack gap="$3">
      <HStack gap="$2">
        <Checkbox id="cb-terms" checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
        <Label htmlFor="cb-terms">Accept terms and conditions</Label>
      </HStack>
      <HStack gap="$2">
        <Checkbox id="cb-disabled" disabled />
        <Label htmlFor="cb-disabled" disabled>
          Disabled option
        </Label>
      </HStack>
    </VStack>
  )
}
