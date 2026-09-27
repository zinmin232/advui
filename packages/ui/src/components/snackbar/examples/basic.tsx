import { Button, Snackbar, Text, VStack } from '@advui/core'
import { useState } from 'react'

export default function SnackbarBasic() {
  const [archived, setArchived] = useState(0)
  const [open, setOpen] = useState(false)

  return (
    <VStack gap="$3" alignItems="center">
      <Button
        onPress={() => {
          setArchived((n) => n + 1)
          setOpen(true)
        }}
      >
        Archive conversation
      </Button>
      <Text size="sm" tone="muted">
        Archived: {archived}
      </Text>
      <Snackbar
        open={open}
        onOpenChange={setOpen}
        action={{ label: 'Undo', onPress: () => setArchived((n) => Math.max(0, n - 1)) }}
      >
        Conversation archived
      </Snackbar>
    </VStack>
  )
}
