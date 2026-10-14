import { Button, ConfirmDialog, toast } from '@advui/core'

export default function ConfirmDialogBasic() {
  return (
    <ConfirmDialog
      trigger={<Button variant="destructive">Delete project</Button>}
      title="Delete “Atlas”?"
      description="The project, its 12 environments and all deploy history are removed. This cannot be undone."
      confirmLabel="Delete project"
      tone="destructive"
      onConfirm={() => {
        toast.success('Project deleted')
      }}
    />
  )
}
