import { Button, IconButton, Text, Toolbar } from '@advui/core'
import { DownloadIcon, TrashIcon, XIcon } from '@advui/icons'

export default function ToolbarBulkActions() {
  return (
    <Toolbar
      aria-label="Selected rows"
      variant="filled"
      width="100%"
      size="sm"
      leading={
        <Text size="sm" paddingHorizontal="2" weight="medium">
          3 selected
        </Text>
      }
      trailing={
        <>
          <Button size="sm" variant="ghost" icon={<DownloadIcon />}>
            Export
          </Button>
          <Button size="sm" variant="destructive" icon={<TrashIcon />}>
            Delete
          </Button>
          <IconButton size="sm" aria-label="Clear selection" icon={<XIcon />} />
        </>
      }
    />
  )
}
