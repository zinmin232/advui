import { AlertDialog, Button, toast } from '@advui/core'
import { LogOutIcon } from '@advui/icons'
import { useState } from 'react'

export default function AlertDialogAsync() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  // A plain Button instead of AlertDialog.Action: Action closes at once, but
  // here the dialog stays open (and busy) until the request finishes.
  const signOut = () => {
    setPending(true)
    setTimeout(() => {
      setPending(false)
      setOpen(false)
      toast.success('Signed out of 3 devices')
    }, 1200)
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialog.Trigger asChild>
        <Button variant="outline" icon={<LogOutIcon />}>
          Sign out everywhere
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Sign out of all devices?</AlertDialog.Title>
          <AlertDialog.Description>
            You will need to sign in again on your phone, tablet and other browsers.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel asChild>
            <Button variant="outline" disabled={pending}>
              Stay signed in
            </Button>
          </AlertDialog.Cancel>
          <Button loading={pending} onPress={signOut}>
            Sign out
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  )
}
