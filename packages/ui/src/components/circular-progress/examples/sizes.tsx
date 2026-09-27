import { CircularProgress, HStack, Text, VStack } from '@advui/core'

export default function CircularProgressSizes() {
  return (
    <VStack gap="$4" alignItems="center">
      <HStack gap="$5" alignItems="center">
        <CircularProgress size="sm" value={30} label="Small" />
        <CircularProgress size="md" value={60} label="Medium" showValue />
        <CircularProgress size="lg" value={90} label="Large" showValue />
      </HStack>
      {/* Without a value the ring spins: use it when the length is unknown. */}
      <HStack gap="$3" alignItems="center">
        <CircularProgress size="sm" label="Syncing" />
        <Text size="sm" tone="muted">
          Syncing…
        </Text>
      </HStack>
    </VStack>
  )
}
