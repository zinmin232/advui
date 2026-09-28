import { Menu } from '@advui/core'
import { FileIcon, MailIcon, StarIcon, TrashIcon, UploadIcon } from '@advui/icons'

export default function MenuBasic() {
  return (
    <Menu aria-label="Mailboxes" defaultValue="inbox" maxWidth="$64">
      <Menu.Group label="Mail">
        <Menu.Item value="inbox" icon={<MailIcon />} trailing={12}>
          Inbox
        </Menu.Item>
        <Menu.Item value="starred" icon={<StarIcon />}>
          Starred
        </Menu.Item>
        <Menu.Item value="sent" icon={<UploadIcon />}>
          Sent
        </Menu.Item>
        <Menu.Item value="drafts" icon={<FileIcon />} trailing={3}>
          Drafts
        </Menu.Item>
      </Menu.Group>
      <Menu.Separator />
      <Menu.Item value="trash" icon={<TrashIcon />}>
        Trash
      </Menu.Item>
    </Menu>
  )
}
