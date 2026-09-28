import { Card, ContextMenu, HStack, Text, VStack, toast } from '@advui/core'
import { CopyIcon, DownloadIcon, EditIcon, FileIcon, TrashIcon } from '@advui/icons'

const files = [
  { name: 'Quarterly report.pdf', size: '2.4 MB' },
  { name: 'Brand guidelines.pdf', size: '8.1 MB' },
  { name: 'Invoice 0042.pdf', size: '120 KB' },
]

export default function ContextMenuList() {
  return (
    <Card padding="$2" gap="$1" width="100%" maxWidth="$96">
      {files.map((file) => (
        <ContextMenu key={file.name}>
          <ContextMenu.Trigger>
            <HStack gap="$3" alignItems="center" padding="$2" borderRadius="$md">
              <FileIcon size={18} color="$mutedForeground" />
              <VStack flex={1}>
                <Text size="sm">{file.name}</Text>
                <Text size="xs" tone="muted">
                  {file.size}
                </Text>
              </VStack>
            </HStack>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <ContextMenu.Label>{file.name}</ContextMenu.Label>
            <ContextMenu.Item icon={<EditIcon />} onSelect={() => toast('Rename')}>
              Rename
            </ContextMenu.Item>
            <ContextMenu.Item icon={<CopyIcon />} onSelect={() => toast('Duplicated')}>
              Duplicate
            </ContextMenu.Item>
            <ContextMenu.Item icon={<DownloadIcon />} onSelect={() => toast('Downloading…')}>
              Download
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item
              icon={<TrashIcon />}
              destructive
              onSelect={() => toast.error(`Deleted ${file.name}`)}
            >
              Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu>
      ))}
    </Card>
  )
}
