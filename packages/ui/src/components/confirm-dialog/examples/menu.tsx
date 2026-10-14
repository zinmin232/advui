import { Button, ConfirmDialog, DropdownMenu, toast } from '@advui/core'
import { EditIcon, MoreHorizontalIcon, PackageIcon } from '@advui/icons'
import { useState } from 'react'

export default function ConfirmDialogMenu() {
  // Controlled: the menu closes when an item is chosen, so the dialog cannot
  // live inside it. The item opens the dialog instead.
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <Button variant="outline" icon={<MoreHorizontalIcon />}>
            Actions
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item icon={<EditIcon />} onSelect={() => toast('Rename')}>
            Rename
          </DropdownMenu.Item>
          <DropdownMenu.Item icon={<PackageIcon />} onSelect={() => setConfirming(true)}>
            Archive…
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Archive “Atlas”?"
        description="Archived projects are read-only. You can restore it from Settings."
        confirmLabel="Archive"
        onConfirm={() => {
          toast.success('Project archived')
        }}
      />
    </>
  )
}
