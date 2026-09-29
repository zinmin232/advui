import { HStack } from '@advui/core'
import { Stat } from '@advui/data'

const sizes = ['sm', 'md', 'lg'] as const

export default function StatSizes() {
  return (
    <HStack gap="$8" flexWrap="wrap" alignItems="flex-end">
      {sizes.map((size) => (
        <Stat key={size} size={size}>
          <Stat.Label>Size {size}</Stat.Label>
          <Stat.Value>2,350</Stat.Value>
          <Stat.HelpText>Orders this week</Stat.HelpText>
        </Stat>
      ))}
    </HStack>
  )
}
