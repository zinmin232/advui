import { IconButton, Toolbar, Tooltip } from '@advui/core'
import { EditIcon, HeadingIcon, ImageIcon, RotateCwIcon, TrashIcon } from '@advui/icons'

const tools = [
  { label: 'Draw', icon: <EditIcon /> },
  { label: 'Text', icon: <HeadingIcon /> },
  { label: 'Image', icon: <ImageIcon /> },
  { label: 'Rotate', icon: <RotateCwIcon /> },
]

// Up and Down move between the tools.
export default function ToolbarVertical() {
  return (
    <Toolbar
      role="toolbar"
      aria-label="Canvas tools"
      orientation="vertical"
      variant="outline"
      size="sm"
    >
      {tools.map(({ label, icon }) => (
        <Tooltip key={label} content={label} side="right">
          <IconButton aria-label={label} icon={icon} />
        </Tooltip>
      ))}
      <Toolbar.Separator />
      <Tooltip content="Delete" side="right">
        <IconButton aria-label="Delete" icon={<TrashIcon />} />
      </Tooltip>
    </Toolbar>
  )
}
