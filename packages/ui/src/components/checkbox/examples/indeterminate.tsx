import { Checkbox, HStack, Label, VStack } from '@adv-ui/core'
import { useState } from 'react'

const items = ['Email', 'SMS', 'Push']

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = useState<string[]>(['Email'])
  const all = selected.length === items.length
  const some = selected.length > 0 && !all
  return (
    <VStack gap="$2">
      <HStack gap="$2">
        <Checkbox
          id="cb-all"
          checked={all ? true : some ? 'indeterminate' : false}
          onCheckedChange={() => setSelected(all ? [] : items)}
        />
        <Label htmlFor="cb-all">All notifications</Label>
      </HStack>
      <VStack gap="$2" paddingLeft="$6">
        {items.map((item) => (
          <HStack key={item} gap="$2">
            <Checkbox
              id={`cb-${item}`}
              checked={selected.includes(item)}
              onCheckedChange={(v) =>
                setSelected((prev) =>
                  v === true ? [...prev, item] : prev.filter((i) => i !== item),
                )
              }
            />
            <Label htmlFor={`cb-${item}`}>{item}</Label>
          </HStack>
        ))}
      </VStack>
    </VStack>
  )
}
