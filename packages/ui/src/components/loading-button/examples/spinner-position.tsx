import { HStack, LoadingButton } from '@advui/core'
import { ArrowRightIcon, DownloadIcon } from '@advui/icons'

export default function LoadingButtonSpinnerPosition() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      {/* The spinner takes the icon's place on its side. */}
      <LoadingButton variant="outline" loading icon={<DownloadIcon />}>
        Export
      </LoadingButton>
      <LoadingButton loading spinnerPosition="right" iconAfter={<ArrowRightIcon />}>
        Continue
      </LoadingButton>
    </HStack>
  )
}
