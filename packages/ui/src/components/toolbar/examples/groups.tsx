import { Button, Toolbar } from '@advui/core'
import { CopyIcon, FileIcon, RotateCcwIcon, RotateCwIcon } from '@advui/icons'

export default function ToolbarGroups() {
  return (
    <Toolbar aria-label="Edit" variant="outline">
      <Toolbar.Group aria-label="History">
        <Button size="sm" variant="ghost" icon={<RotateCcwIcon />}>
          Undo
        </Button>
        <Button size="sm" variant="ghost" icon={<RotateCwIcon />}>
          Redo
        </Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Group aria-label="Clipboard">
        <Button size="sm" variant="ghost" icon={<CopyIcon />}>
          Copy
        </Button>
        <Button size="sm" variant="ghost" icon={<FileIcon />}>
          Paste
        </Button>
      </Toolbar.Group>
    </Toolbar>
  )
}
