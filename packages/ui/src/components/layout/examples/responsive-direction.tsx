import { Box, Stack, Text } from '@advui/core'

export default function StackResponsiveDirection() {
  return (
    <Stack direction={{ base: 'column', md: 'row' }} align="stretch" gap="$3" width="100%">
      {['Plan', 'Build', 'Ship'].map((step, index) => (
        <Box key={step} $md={{ flex: 1 }} padding="$4" backgroundColor="$muted" borderRadius="$lg">
          <Text size="sm" tone="muted">
            Step {index + 1}
          </Text>
          <Text weight="medium">{step}</Text>
        </Box>
      ))}
    </Stack>
  )
}
