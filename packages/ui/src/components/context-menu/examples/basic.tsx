import { ContextMenu, Text, toast } from '@advui/core'
import { ArrowLeftIcon, ArrowRightIcon, CopyIcon } from '@advui/icons'
import { useState } from 'react'

export default function ContextMenuBasic() {
  const [bookmarks, setBookmarks] = useState(true)
  const [zoom, setZoom] = useState('100')
  return (
    <ContextMenu>
      <ContextMenu.Trigger
        width="100%"
        maxWidth="$96"
        height="$40"
        alignItems="center"
        justifyContent="center"
        borderWidth={1}
        borderStyle="dashed"
        borderColor="$borderStrong"
        borderRadius="$lg"
      >
        <Text size="sm" tone="muted">
          Right-click here (long-press on touch)
        </Text>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item icon={<ArrowLeftIcon />} shortcut="Alt+←" onSelect={() => toast('Back')}>
          Back
        </ContextMenu.Item>
        <ContextMenu.Item icon={<ArrowRightIcon />} shortcut="Alt+→" disabled>
          Forward
        </ContextMenu.Item>
        <ContextMenu.Item icon={<CopyIcon />} shortcut="Ctrl+C" onSelect={() => toast('Copied')}>
          Copy link
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.CheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
          Show bookmarks
        </ContextMenu.CheckboxItem>
        <ContextMenu.Separator />
        <ContextMenu.Label>Zoom</ContextMenu.Label>
        <ContextMenu.RadioGroup value={zoom} onValueChange={setZoom}>
          <ContextMenu.RadioItem value="100">100%</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="125">125%</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="150">150%</ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>
      </ContextMenu.Content>
    </ContextMenu>
  )
}
