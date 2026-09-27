import { Button, Snackbar, toast } from '@advui/core'
import { useState } from 'react'

export default function SnackbarPersistent() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onPress={() => setOpen(true)}>
        Go offline
      </Button>
      {/* duration={null}: it stays until the user acts, and gets a close button. */}
      <Snackbar
        open={open}
        onOpenChange={setOpen}
        duration={null}
        action={{ label: 'Retry', onPress: () => toast.success('Back online') }}
      >
        You're offline. Changes will sync when you reconnect.
      </Snackbar>
    </>
  )
}
