import { Checkbox, HStack, Input, Label, VStack } from '@advui/core'

export default function LabelBasic() {
  return (
    <VStack gap="$4" width="100%" maxWidth="$80">
      <VStack gap="$2">
        <Label htmlFor="full-name" required>
          Full name
        </Label>
        <Input id="full-name" required placeholder="Ada Lovelace" />
      </VStack>
      <HStack gap="$2">
        <Checkbox id="remember" />
        <Label htmlFor="remember">Remember me</Label>
      </HStack>
    </VStack>
  )
}
