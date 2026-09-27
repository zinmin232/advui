import { Card, Fab, Text, VStack, toast } from '@advui/core'
import { EditIcon } from '@advui/icons'

export default function FabExtended() {
  return (
    // `placement` pins the FAB to a corner of its nearest positioned parent,
    // usually the screen; here a card stands in for the screen.
    <Card position="relative" width="100%" maxWidth="$96" height="$56" overflow="hidden">
      <VStack padding="$4" gap="$2">
        <Text weight="semibold">Inbox</Text>
        <Text size="sm" tone="muted">
          No new messages.
        </Text>
      </VStack>
      <Fab
        placement="bottom-end"
        icon={<EditIcon />}
        label="Compose"
        onPress={() => toast('New message')}
      />
    </Card>
  )
}
