import { Button, Toolbar } from '@advui/core'

// Text-only buttons, so the bar fits a 360pt phone.
export default function ToolbarGroups() {
  return (
    <Toolbar aria-label="Edit" variant="outline">
      <Toolbar.Group aria-label="History">
        <Button size="sm" variant="ghost">
          Undo
        </Button>
        <Button size="sm" variant="ghost">
          Redo
        </Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Group aria-label="Clipboard">
        <Button size="sm" variant="ghost">
          Copy
        </Button>
        <Button size="sm" variant="ghost">
          Paste
        </Button>
      </Toolbar.Group>
    </Toolbar>
  )
}
