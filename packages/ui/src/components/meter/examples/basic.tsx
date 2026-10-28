import { HStack, Meter, Text, VStack } from '@advui/core'

export default function MeterBasic() {
  return (
    <VStack gap="2" width="100%" maxWidth="96">
      <HStack justifyContent="space-between">
        <Text size="sm">Storage</Text>
        <Text size="sm" tone="muted">
          7.2 of 10 GB
        </Text>
      </HStack>
      <Meter value={7.2} max={10} label="Storage" valueText="7.2 of 10 GB used" />
    </VStack>
  )
}
