import { HStack, Meter, Text, VStack } from '@advui/core'

// Low below 20%, high above 50%, best at 100%: green, then amber, then red.
const battery = { low: 20, high: 50, optimum: 100 }

export default function MeterRanges() {
  return (
    <VStack gap="4" width="100%" maxWidth="96">
      {[
        { device: 'Headphones', level: 82 },
        { device: 'Keyboard', level: 41 },
        { device: 'Mouse', level: 12 },
      ].map(({ device, level }) => (
        <VStack key={device} gap="2">
          <HStack justifyContent="space-between">
            <Text size="sm">{device}</Text>
            <Text size="sm" tone="muted">
              {level}%
            </Text>
          </HStack>
          <Meter value={level} label={`${device} battery`} size="sm" {...battery} />
        </VStack>
      ))}
    </VStack>
  )
}
