import { Box, Stack, Text } from '@advui/core'

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']

export default function StackWrap() {
  return (
    <Stack direction="row" wrap="wrap" gap="$2" maxWidth="$64" aria-label="Sizes" role="list">
      {sizes.map((size) => (
        <Box
          key={size}
          role="listitem"
          width="$12"
          paddingVertical="$2"
          alignItems="center"
          borderWidth={1}
          borderColor="$border"
          borderRadius="$md"
        >
          <Text size="sm">{size}</Text>
        </Box>
      ))}
    </Stack>
  )
}
