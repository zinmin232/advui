import { Box, Stack, Text } from '@adv-ui/core'

export default function StackResponsive() {
  return (
    <Stack gap="$3" width="100%" $md={{ flexDirection: 'row' }}>
      {['One', 'Two', 'Three'].map((label) => (
        <Box key={label} flex={1} padding="$4" backgroundColor="$muted" borderRadius="$lg">
          <Text weight="medium">{label}</Text>
          <Text size="sm" tone="muted">
            Column on phones, row from md.
          </Text>
        </Box>
      ))}
    </Stack>
  )
}
