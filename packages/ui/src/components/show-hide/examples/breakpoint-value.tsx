import {
  Badge,
  Card,
  Grid,
  HStack,
  Text,
  VStack,
  useBreakpoint,
  useBreakpointValue,
} from '@advui/core'

const states = ['Kachin', 'Shan', 'Rakhine', 'Chin', 'Sagaing', 'Magway']

export default function ShowHideBreakpointValue() {
  const breakpoint = useBreakpoint()
  // For behavior: how many rows to preview. Layout itself uses responsive props.
  const preview = useBreakpointValue({ base: 2, md: 4, lg: 6 }) ?? 2

  return (
    <VStack gap="$3" width="100%">
      <HStack gap="$2" wrap="wrap">
        <Text size="sm" tone="muted">
          Breakpoint
        </Text>
        <Badge variant="secondary">{breakpoint}</Badge>
        <Text size="sm" tone="muted">
          Showing {preview} of {states.length}
        </Text>
      </HStack>
      <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="$3">
        {states.slice(0, preview).map((state) => (
          <Card key={state} padding="$3">
            <Text weight="medium">{state}</Text>
          </Card>
        ))}
      </Grid>
    </VStack>
  )
}
