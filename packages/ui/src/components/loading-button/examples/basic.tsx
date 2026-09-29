import { HStack, LoadingButton } from '@advui/core'

export default function LoadingButtonBasic() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      <LoadingButton>Save</LoadingButton>
      <LoadingButton loading>Save</LoadingButton>
    </HStack>
  )
}
