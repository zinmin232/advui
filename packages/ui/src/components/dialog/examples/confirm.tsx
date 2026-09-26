import { Button, Dialog, toast } from '@advui/core'
import { useState } from 'react'

export default function DialogConfirm() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="destructive">Delete project</Button>
      </Dialog.Trigger>
      <Dialog.Content size="sm" hideCloseButton>
        <Dialog.Header>
          <Dialog.Title>Delete this project?</Dialog.Title>
          <Dialog.Description>This permanently deletes “Atlas” and its data.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">Keep project</Button>
          </Dialog.Close>
          <Button
            variant="destructive"
            onPress={() => {
              setOpen(false)
              toast.success('Project deleted')
            }}
          >
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}
