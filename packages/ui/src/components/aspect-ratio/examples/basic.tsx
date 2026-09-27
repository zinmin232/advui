import { AspectRatio, Text, VStack } from '@advui/core'
import { Image } from 'react-native'

export default function AspectRatioBasic() {
  return (
    <VStack gap="$2" width="100%" maxWidth="$96">
      <AspectRatio ratio={16 / 9} borderRadius="$lg" backgroundColor="$muted">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=70',
          }}
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel="A desert road between red rock canyons"
        />
      </AspectRatio>
      <Text size="sm" tone="muted">
        The photo stays 16:9 at any width.
      </Text>
    </VStack>
  )
}
