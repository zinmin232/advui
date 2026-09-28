import { Image, Text, VStack, HStack } from '@advui/core'

const fits = ['cover', 'contain'] as const

export default function ImageFit() {
  return (
    <HStack gap="$4" flexWrap="wrap">
      {fits.map((fit) => (
        <VStack key={fit} gap="$2" alignItems="center">
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=70"
            alt="A lake below forested mountains"
            fit={fit}
            width="$40"
            height="$40"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$border"
          />
          <Text size="sm" tone="muted">
            {fit}
          </Text>
        </VStack>
      ))}
    </HStack>
  )
}
