import { HStack, Spinner } from '@adv-ui/core'

export default function SpinnerBasic() {
  return (
    <HStack gap="$4" alignItems="center">
      <Spinner size="sm" />
      <Spinner size="md" color="$primary" />
      <Spinner size="lg" color="$success" label="Syncing" />
    </HStack>
  )
}
