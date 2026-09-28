import { HStack, Stat } from '@advui/core'

export default function StatBasic() {
  return (
    <Stat>
      <Stat.Label>Monthly active users</Stat.Label>
      <Stat.Value>12,480</Stat.Value>
      <HStack gap="$1.5" alignItems="center">
        <Stat.Delta trend="up">8.2%</Stat.Delta>
        <Stat.HelpText>vs. last month</Stat.HelpText>
      </HStack>
    </Stat>
  )
}
