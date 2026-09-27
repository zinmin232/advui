import { Avatar, Chip, HStack, Text, VStack, toast } from '@advui/core'
import { CalendarIcon, MailIcon, UsersIcon } from '@advui/icons'
import { useState } from 'react'

export default function ChipInput() {
  const [recipients, setRecipients] = useState(['Ada Lovelace', 'Grace Hopper', 'Alan Turing'])

  return (
    <VStack gap="$4">
      <VStack gap="$2">
        <Text size="sm" weight="medium">
          To
        </Text>
        <HStack gap="$2" flexWrap="wrap">
          {recipients.map((name) => (
            <Chip
              key={name}
              icon={<Avatar size="xs" alt={name} aria-hidden />}
              onRemove={() => setRecipients((prev) => prev.filter((n) => n !== name))}
            >
              {name}
            </Chip>
          ))}
          {recipients.length === 0 ? (
            <Text size="sm" tone="muted">
              No recipients
            </Text>
          ) : null}
        </HStack>
      </VStack>
      <VStack gap="$2">
        <Text size="sm" weight="medium">
          Suggested
        </Text>
        <HStack gap="$2" flexWrap="wrap">
          <Chip icon={<CalendarIcon />} onPress={() => toast('Meeting scheduled')}>
            Schedule meeting
          </Chip>
          <Chip icon={<MailIcon />} onPress={() => toast('Reply drafted')}>
            Reply to all
          </Chip>
          <Chip icon={<UsersIcon />} onPress={() => toast('Invites sent')} disabled>
            Invite team
          </Chip>
        </HStack>
      </VStack>
    </VStack>
  )
}
