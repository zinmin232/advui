import { HStack, IconButton, Tooltip } from '@advui/core'
import { CopyIcon, DownloadIcon, TrashIcon } from '@advui/icons'

export default function TooltipBasic() {
  return (
    <HStack gap="$1">
      <Tooltip content="Copy link">
        <IconButton aria-label="Copy link" icon={<CopyIcon />} />
      </Tooltip>
      <Tooltip content="Download" side="bottom">
        <IconButton aria-label="Download" icon={<DownloadIcon />} />
      </Tooltip>
      <Tooltip content="Move to trash">
        <IconButton aria-label="Move to trash" icon={<TrashIcon />} />
      </Tooltip>
    </HStack>
  )
}
