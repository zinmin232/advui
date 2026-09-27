import { AlertDialog, Button, toast } from '@advui/core'

export default function AlertDialogBasic() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger asChild>
        <Button variant="destructive">Delete project</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete “Atlas”?</AlertDialog.Title>
          <AlertDialog.Description>
            The project, its 12 environments and all deploy history are removed. This cannot be
            undone.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <Button variant="destructive" onPress={() => toast.success('Project deleted')}>
              Delete project
            </Button>
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  )
}
