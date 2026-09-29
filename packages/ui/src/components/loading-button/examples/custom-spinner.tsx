import { HStack, LoadingButton } from '@advui/core'
import { LoaderIcon } from '@advui/icons'

export default function LoadingButtonCustomSpinner() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      {/* Icons inside the button take its size and label color. */}
      <LoadingButton variant="secondary" loading spinner={<LoaderIcon />}>
        Sync partners
      </LoadingButton>
    </HStack>
  )
}
