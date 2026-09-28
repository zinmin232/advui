import { List } from '@advui/core'
import { FileIcon, FolderIcon, ImageIcon } from '@advui/icons'

export default function ListBasic() {
  return (
    <List width="100%" maxWidth="$96">
      <List.Item leading={<FolderIcon />} title="Field reports" description="12 files" />
      <List.Item leading={<FileIcon />} title="Budget 2026.xlsx" description="Edited yesterday" />
      <List.Item
        leading={<ImageIcon />}
        title="Site photo.jpg"
        description="2.4 MB"
        trailing="JPG"
      />
    </List>
  )
}
