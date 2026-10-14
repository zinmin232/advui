import { Button, ConfirmDialog, toast } from '@advui/core'
import { LogOutIcon } from '@advui/icons'

const signOutEverywhere = () => new Promise<void>((resolve) => setTimeout(resolve, 1200))

export default function ConfirmDialogAsync() {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" icon={<LogOutIcon />}>
          Sign out everywhere
        </Button>
      }
      title="Sign out of all devices?"
      description="You will need to sign in again on your phone, tablet and other browsers."
      confirmLabel="Sign out"
      cancelLabel="Stay signed in"
      // Returning the Promise keeps the dialog open and busy until it resolves.
      onConfirm={async () => {
        await signOutEverywhere()
        toast.success('Signed out of 3 devices')
      }}
    />
  )
}
