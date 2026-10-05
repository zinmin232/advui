import { Image, Text, HStack } from '@advui/core'

export default function ImageFallback() {
  return (
    <HStack gap="$4" flexWrap="wrap">
      {/* `.invalid` never resolves (RFC 2606), so the image fails on every platform. */}
      <Image
        src="https://example.invalid/missing-photo.jpg"
        alt="Clinic entrance"
        width="$40"
        ratio={4 / 3}
        borderRadius="$md"
      />
      <Image
        src="https://example.invalid/missing-photo.jpg"
        alt="Team photo"
        width="$40"
        ratio={4 / 3}
        borderRadius="$md"
        fallback={
          <Text size="sm" tone="muted">
            Photo unavailable
          </Text>
        }
      />
    </HStack>
  )
}
