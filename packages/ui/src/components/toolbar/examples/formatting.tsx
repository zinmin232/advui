import { IconButton, ToggleGroup, Toolbar, Tooltip } from '@advui/core'
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  QuoteIcon,
  UnderlineIcon,
} from '@advui/icons'

// role="toolbar": one Tab stop, and the arrow keys move across every control,
// the Toggle Group items included.
export default function ToolbarFormatting() {
  return (
    <Toolbar role="toolbar" aria-label="Formatting" variant="outline" size="sm">
      <ToggleGroup type="multiple" size="sm" defaultValue={['bold']} aria-label="Text style">
        <ToggleGroup.Item value="bold" aria-label="Bold" icon={<BoldIcon />} />
        <ToggleGroup.Item value="italic" aria-label="Italic" icon={<ItalicIcon />} />
        <ToggleGroup.Item value="underline" aria-label="Underline" icon={<UnderlineIcon />} />
      </ToggleGroup>
      <Toolbar.Separator />
      <ToggleGroup type="single" size="sm" defaultValue="left" aria-label="Alignment">
        <ToggleGroup.Item value="left" aria-label="Align left" icon={<AlignLeftIcon />} />
        <ToggleGroup.Item value="center" aria-label="Align center" icon={<AlignCenterIcon />} />
        <ToggleGroup.Item value="right" aria-label="Align right" icon={<AlignRightIcon />} />
      </ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.Group aria-label="Insert">
        <Tooltip content="Insert link">
          <IconButton size="sm" aria-label="Insert link" icon={<LinkIcon />} />
        </Tooltip>
        <Tooltip content="Quote">
          <IconButton size="sm" aria-label="Quote" icon={<QuoteIcon />} />
        </Tooltip>
      </Toolbar.Group>
    </Toolbar>
  )
}
