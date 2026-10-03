import { Box, Grid, Text } from '@advui/core'

function Cell({ label }: { label: string }) {
  return (
    <Box flexGrow={1} padding="$3" borderRadius="$md" backgroundColor="$muted">
      <Text size="sm" weight="medium">
        {label}
      </Text>
    </Box>
  )
}

export default function GridOffset() {
  return (
    <Grid columns={12} gap="$3" width="100%">
      <Grid.Item span={{ base: 12, md: 6 }} offset={{ md: 3 }}>
        <Cell label="md: span 6, offset 3" />
      </Grid.Item>
      <Grid.Item span={4} offset={8}>
        <Cell label="span 4, offset 8" />
      </Grid.Item>
      <Grid.Item span={4}>
        <Cell label="span 4" />
      </Grid.Item>
      <Grid.Item span={4} offset={4}>
        <Cell label="span 4, offset 4" />
      </Grid.Item>
    </Grid>
  )
}
