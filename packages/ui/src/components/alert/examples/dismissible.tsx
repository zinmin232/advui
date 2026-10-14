import { Alert, Button, VStack } from '@advui/core'
import { useState } from 'react'

export default function AlertDismissible() {
  const [open, setOpen] = useState(true)
  return (
    <VStack gap="$3" width="100%" alignItems="flex-start">
      <Alert
        variant="error"
        title="Connection failed"
        description="Unable to connect to the server. Changes are kept on this device."
        dismissible
        open={open}
        onDismiss={() => setOpen(false)}
        alignSelf="stretch"
      />
      {open ? null : (
        <Button size="sm" variant="outline" onPress={() => setOpen(true)}>
          Show again
        </Button>
      )}
    </VStack>
  )
}
