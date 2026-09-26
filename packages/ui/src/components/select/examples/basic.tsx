import { Label, Select, VStack } from '@adv-ui/core'
import { useState } from 'react'

export default function SelectBasic() {
  const [fruit, setFruit] = useState('apple')
  return (
    <VStack gap="$2" width="100%" maxWidth="$64">
      <Label htmlFor="select-fruit">Favorite fruit</Label>
      <Select id="select-fruit" value={fruit} onValueChange={setFruit}>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="mango">Mango</Select.Item>
        <Select.Item value="pineapple">Pineapple</Select.Item>
      </Select>
    </VStack>
  )
}
