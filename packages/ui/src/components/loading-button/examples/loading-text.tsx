import { HStack, LoadingButton } from '@advui/core'

export default function LoadingButtonLoadingText() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      <LoadingButton loading loadingText="Saving…">
        Save
      </LoadingButton>
      <LoadingButton variant="outline" loading loadingText="Uploading 5W data…">
        Upload
      </LoadingButton>
    </HStack>
  )
}
