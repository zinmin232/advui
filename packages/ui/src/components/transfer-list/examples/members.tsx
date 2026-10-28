import { Text, TransferList, VStack } from '@advui/core'
import { useState } from 'react'

const people = [
  { value: 'ada', label: 'Ada Okafor', description: 'Design' },
  { value: 'ben', label: 'Ben Tanaka', description: 'Engineering' },
  { value: 'cleo', label: 'Cleo Martin', description: 'Engineering' },
  { value: 'dev', label: 'Dev Patel', description: 'Support' },
  // The owner cannot leave the team. axe checks the contrast of a disabled
  // item's description (dimmed), but not of its label.
  { value: 'eli', label: 'Eli Novak (owner)', disabled: true },
]

export default function TransferListMembers() {
  const [members, setMembers] = useState(['eli', 'ben'])
  return (
    <VStack gap="3" width="100%" maxWidth="128">
      <TransferList
        items={people}
        value={members}
        onValueChange={setMembers}
        labels={{ source: 'People', target: 'Team' }}
        listHeight="64"
      />
      <Text size="sm" tone="muted">
        {members.length} on the team
      </Text>
    </VStack>
  )
}
