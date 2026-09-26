import { HStack, Skeleton, VStack } from '@advui/core'

export default function SkeletonCard() {
  return (
    <VStack gap="$3" width="100%" maxWidth="$80" aria-busy aria-label="Loading profile">
      <HStack gap="$3">
        <Skeleton circle width="$12" height="$12" />
        <VStack gap="$2" flex={1} justifyContent="center">
          <Skeleton height="$3" width="70%" />
          <Skeleton height="$3" width="40%" />
        </VStack>
      </HStack>
      <Skeleton height="$32" borderRadius="$lg" />
    </VStack>
  )
}
