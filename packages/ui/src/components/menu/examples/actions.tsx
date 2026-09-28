import { Badge, Card, Menu, toast } from '@advui/core'
import { CopyIcon, DownloadIcon, EditIcon, LockIcon, TrashIcon } from '@advui/icons'

export default function MenuActions() {
  return (
    <Card padding="$1.5" maxWidth="$64" width="100%">
      <Menu aria-label="Document actions">
        <Menu.Item icon={<EditIcon />} onSelect={() => toast('Renamed')}>
          Rename
        </Menu.Item>
        <Menu.Item icon={<CopyIcon />} onSelect={() => toast('Duplicated')}>
          Duplicate
        </Menu.Item>
        <Menu.Item
          icon={<DownloadIcon />}
          trailing={<Badge variant="secondary">PDF</Badge>}
          onSelect={() => toast('Downloading…')}
        >
          Download
        </Menu.Item>
        <Menu.Item icon={<LockIcon />} disabled>
          Protect (Pro)
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<TrashIcon />} destructive onSelect={() => toast.error('Deleted')}>
          Delete
        </Menu.Item>
      </Menu>
    </Card>
  )
}
