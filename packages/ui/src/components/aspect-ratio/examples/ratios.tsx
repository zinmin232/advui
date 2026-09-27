import { AspectRatio, Center, HStack, Text } from '@advui/core'

const ratios = [
  { label: '1:1', ratio: 1 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '16:9', ratio: 16 / 9 },
]

export default function AspectRatioRatios() {
  return (
    <HStack gap="$3" flexWrap="wrap" alignItems="flex-start">
      {ratios.map((item) => (
        // Same width, so the height alone shows the ratio.
        <AspectRatio
          key={item.label}
          ratio={item.ratio}
          width="$32"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$border"
          backgroundColor="$muted"
        >
          <Center flex={1}>
            <Text size="sm" weight="medium">
              {item.label}
            </Text>
          </Center>
        </AspectRatio>
      ))}
    </HStack>
  )
}
