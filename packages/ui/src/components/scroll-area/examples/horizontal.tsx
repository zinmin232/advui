import { AspectRatio, Center, HStack, ScrollArea, Text, VStack } from '@advui/core'

const albums = ['Nightfall', 'Tidal', 'Aurora', 'Monsoon', 'Ember', 'Cirrus', 'Harbor']

export default function ScrollAreaHorizontal() {
  return (
    <ScrollArea
      orientation="horizontal"
      aria-label="New albums"
      width="100%"
      maxWidth="$96"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$md"
    >
      <HStack gap="$4" padding="$4">
        {albums.map((album) => (
          <VStack key={album} width="$32" gap="$2">
            <AspectRatio borderRadius="$md" backgroundColor="$primarySoft">
              <Center flex={1}>
                <Text size="lg" weight="semibold" color="$primarySoftForeground">
                  {album[0]}
                </Text>
              </Center>
            </AspectRatio>
            <Text size="sm">{album}</Text>
          </VStack>
        ))}
      </HStack>
    </ScrollArea>
  )
}
