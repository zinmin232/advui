import { Avatar, HStack, HoverCard, Text, VStack } from '@advui/core'
import { CalendarIcon } from '@advui/icons'

export default function HoverCardBasic() {
  return (
    <Text size="sm">
      Reviewed by{' '}
      <HoverCard>
        <HoverCard.Trigger>
          <Text
            // A link on web (Text does not type `href`, so it is spread); in an
            // app, navigate with your router in onPress.
            render="a"
            {...{ href: '#ada' }}
            size="sm"
            weight="semibold"
            tone="primary"
            textDecorationLine="underline"
          >
            @ada
          </Text>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <HStack gap="$3">
            <Avatar alt="Ada Lovelace" />
            <VStack gap="$1" flex={1}>
              <Text size="sm" weight="semibold">
                Ada Lovelace
              </Text>
              <Text size="sm">Writes the first algorithms meant for a machine.</Text>
              <HStack gap="$1.5" alignItems="center" paddingTop="$1">
                <CalendarIcon size={14} color="$mutedForeground" />
                <Text size="xs" tone="muted">
                  Joined December 1842
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </HoverCard.Content>
      </HoverCard>{' '}
      — hover or focus the name for a preview.
    </Text>
  )
}
