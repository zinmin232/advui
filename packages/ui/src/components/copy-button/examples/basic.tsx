import { CopyButton, HStack, Text } from '@advui/core'

export default function CopyButtonBasic() {
  return (
    <HStack alignItems="center" gap="$2">
      <Text mono>pnpm add @advui/core</Text>
      <CopyButton value="pnpm add @advui/core" labels={{ copy: 'Copy command' }} />
    </HStack>
  )
}
